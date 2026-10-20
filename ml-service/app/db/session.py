"""
Sesión de base de datos con SQLAlchemy async.
Comparte la misma instancia de PostgreSQL (Supabase) que usa Drizzle en Next.js.
"""
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

# pool_size/max_overflow solo aplican a Postgres (SQLite se usa únicamente en pruebas)
_pool_kwargs = (
    {} if settings.DATABASE_URL.startswith("sqlite") else {"pool_size": 5, "max_overflow": 10}
)

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # detecta conexiones caídas antes de usarlas
    echo=(settings.ENVIRONMENT == "development"),
    **_pool_kwargs,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependencia de FastAPI para inyectar la sesión de BD en los routers."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
