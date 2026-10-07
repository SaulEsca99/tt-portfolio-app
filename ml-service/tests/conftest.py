"""Fixtures de pruebas: BD SQLite en memoria con datos sintéticos y cliente HTTP."""
import os
import uuid
from datetime import date, datetime, timedelta, timezone

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite://")
os.environ.setdefault("ML_SERVICE_API_KEY", "test-key")

import numpy as np
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.pool import StaticPool

from app.db.models import (
    Asset,
    Base,
    Portfolio,
    PortfolioCandidate,
    PriceHistory,
    User,
)


@compiles(JSONB, "sqlite")
def _jsonb_sqlite(type_, compiler, **kw):  # JSONB no existe en SQLite
    return "JSON"


TICKERS = ["AAA", "BBB", "CCC", "DDD", "EEE"]
AUTH = {"Authorization": "Bearer test-key"}


@pytest_asyncio.fixture
async def session_factory():
    engine = create_async_engine(
        "sqlite+aiosqlite://", poolclass=StaticPool, connect_args={"check_same_thread": False}
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    rng = np.random.default_rng(3)
    async with factory() as db:
        db.add(User(id="user_1", email="a@b.c", name="T", created_at=datetime.now(timezone.utc)))
        pid = uuid.uuid4()
        db.add(
            Portfolio(
                id=pid, user_id="user_1", name="P", risk_aversion_lambda=2,
                max_assets=3, created_at=datetime.now(timezone.utc),
            )
        )
        days = [date.today() - timedelta(days=i) for i in range(900, 0, -1)]
        days = [d for d in days if d.weekday() < 5]
        for k, t in enumerate(TICKERS):
            a = Asset(id=uuid.uuid4(), ticker=t, name=t)
            db.add(a)
            db.add(PortfolioCandidate(id=uuid.uuid4(), portfolio_id=pid, asset_id=a.id,
                                      min_weight=0, max_weight=0.6))
            r = rng.normal(0.0002 + 0.0001 * k, 0.008 + 0.002 * k, size=len(days))
            p = 100 * np.exp(np.cumsum(r))
            for d, px in zip(days, p):
                db.add(PriceHistory(id=uuid.uuid4(), asset_id=a.id, date=d, close=float(px),
                                    adj_close=float(px), source="test",
                                    fetched_at=datetime.now(timezone.utc)))
        await db.commit()
    factory.portfolio_id = str(pid)
    yield factory
    await engine.dispose()


@pytest_asyncio.fixture
async def client(session_factory):
    from app.db.session import get_db
    from app.main import app

    async def _get_db():
        async with session_factory() as s:
            try:
                yield s
                await s.commit()
            except Exception:
                await s.rollback()
                raise

    app.dependency_overrides[get_db] = _get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://t", headers=AUTH) as c:
        c.portfolio_id = session_factory.portfolio_id
        yield c
    app.dependency_overrides.clear()
