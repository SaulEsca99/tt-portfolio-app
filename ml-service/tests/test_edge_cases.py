"""Regresiones de casos límite hallados en la auditoría."""
import uuid
from datetime import date, datetime, timedelta, timezone

import numpy as np
import pytest
from sqlalchemy import select, update

from app.db.models import Asset, OptimizationRun, Portfolio, PortfolioCandidate, PriceHistory
from app.optimization.common import prepare_bounds
from app.optimization.portfolio_math import repair

FAST = {"population_size": 20, "generations": 15}


async def _add_asset(sf, pid, ticker, n_days, zero_at=None, maxw=0.6):
    rng = np.random.default_rng(99)
    async with sf() as db:
        a = Asset(id=uuid.uuid4(), ticker=ticker, name=ticker)
        db.add(a)
        db.add(PortfolioCandidate(id=uuid.uuid4(), portfolio_id=uuid.UUID(pid), asset_id=a.id,
                                  min_weight=0, max_weight=maxw))
        days = [d for d in (date.today() - timedelta(days=i) for i in range(n_days, 0, -1)) if d.weekday() < 5]
        p = 100 * np.exp(np.cumsum(rng.normal(0.0003, 0.01, len(days))))
        for k, (d, px) in enumerate(zip(days, p)):
            v = 0.0 if k == zero_at else float(px)
            db.add(PriceHistory(id=uuid.uuid4(), asset_id=a.id, date=d, close=v, adj_close=v,
                                source="t", fetched_at=datetime.now(timezone.utc)))
        await db.commit()


def test_repair_never_fails_when_bounds_are_feasible():
    rng = np.random.default_rng(0)
    checked = 0
    for _ in range(3000):
        n, K = int(rng.integers(5, 12)), int(rng.integers(2, 5))
        hi, lo = rng.uniform(0.05, 0.9, n), np.zeros(n)
        try:
            prepare_bounds(n, lo, hi, K)
        except ValueError:
            continue
        w = repair(rng.normal(size=n), lo, hi, K)       # no debe lanzar
        assert w.sum() == pytest.approx(1.0, abs=1e-9)
        assert (w <= hi + 1e-9).all() and (w > 1e-12).sum() <= K
        checked += 1
    assert checked > 500


@pytest.mark.parametrize("algo", ["ga", "pso", "de"])
async def test_heterogeneous_caps_with_cardinality(client, session_factory, algo):
    async with session_factory() as db:
        cands = (await db.execute(select(PortfolioCandidate))).scalars().all()
        for c, m in zip(cands, [0.9, 0.2, 0.2, 0.2, 0.2]):
            c.max_weight = m
        (await db.execute(select(Portfolio))).scalar_one().max_assets = 2
        await db.commit()
    r = await client.post("/optimize", json={"portfolio_id": client.portfolio_id,
                                             "algorithm": algo, "params": FAST})
    assert r.status_code == 200, r.text
    assert len(r.json()["weights"]) <= 2


async def test_short_history_asset_does_not_truncate_sample(client, session_factory):
    await _add_asset(session_factory, client.portfolio_id, "NEW", 130)
    r = await client.post("/optimize", json={"portfolio_id": client.portfolio_id,
                                             "algorithm": "de", "params": FAST})
    body = r.json()
    assert r.status_code == 200
    assert "NEW" in body["excluded"] and "historial muy corto" in body["excluded"]["NEW"]
    assert body["nObservations"] > 600


async def test_candidate_without_prices_is_reported(client, session_factory):
    await _add_asset(session_factory, client.portfolio_id, "EMPTY", 0)
    body = (await client.post("/optimize", json={"portfolio_id": client.portfolio_id,
                                                 "algorithm": "de", "params": FAST})).json()
    assert body["excluded"] == {"EMPTY": "sin precios en la base de datos"}
    assert "EMPTY" not in {w["ticker"] for w in body["weights"]}


async def test_zero_price_is_treated_as_missing(client, session_factory):
    await _add_asset(session_factory, client.portfolio_id, "BAD", 900, zero_at=50)
    r = await client.post("/optimize", json={"portfolio_id": client.portfolio_id,
                                             "algorithm": "de", "params": FAST})
    assert r.status_code == 200, r.text


async def test_infeasible_run_is_persisted_as_error(client, session_factory):
    async with session_factory() as db:
        await db.execute(update(PortfolioCandidate).values(max_weight=0.1))
        await db.commit()
    r = await client.post("/optimize", json={"portfolio_id": client.portfolio_id, "params": FAST})
    assert r.status_code == 422
    async with session_factory() as db:
        runs = (await db.execute(select(OptimizationRun))).scalars().all()
    assert [x.status for x in runs] == ["error"]
