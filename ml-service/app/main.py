"""
Entrypoint de FastAPI.
Registra los routers y configura middleware de seguridad.
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.security import verify_api_key
from app.routers import optimize, backtest, predict, assets

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Un fallo de mantenimiento nunca debe impedir que el servicio arranque.
    try:
        from app.db.session import AsyncSessionLocal
        from app.services.maintenance import reap_stale_runs

        async with AsyncSessionLocal() as db:
            n = await reap_stale_runs(db)
        if n:
            logger.warning("%d corrida(s) 'running' obsoletas marcadas como error", n)
    except Exception:  # noqa: BLE001
        logger.exception("No se pudo limpiar corridas obsoletas")
    yield


app = FastAPI(
    lifespan=lifespan,
    title="TT — Portfolio Optimization ML Service",
    version="0.1.0",
    # Oculta la documentación en producción (no es necesaria ahí)
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url=None,
)

# CORS: solo el dominio de Next.js puede llamar a esta API.
# En producción, Render + Vercel están en dominios distintos.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.NEXT_APP_URL],
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

# Registrar routers (todos requieren API key — ver security.py)
app.include_router(assets.router, prefix="/assets", tags=["assets"])
app.include_router(predict.router, prefix="/predict", tags=["predict"])
app.include_router(optimize.router, prefix="/optimize", tags=["optimize"])
app.include_router(backtest.router, prefix="/backtest", tags=["backtest"])


@app.get("/health", tags=["health"])
async def health():
    """Health check — Render lo usa para verificar que el servicio está vivo."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}
