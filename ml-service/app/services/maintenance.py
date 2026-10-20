"""Tareas de mantenimiento de la BD ejecutadas al arrancar el servicio."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import OptimizationRun


async def reap_stale_runs(db: AsyncSession, older_than_minutes: int = 15) -> int:
    """
    Marca como 'error' las corridas que quedaron en 'running' (p. ej. el proceso se reinició
    a mitad de una optimización) para que la UI no las muestre en progreso indefinidamente.
    Devuelve cuántas se corrigieron.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=older_than_minutes)
    res = await db.execute(
        update(OptimizationRun)
        .where(OptimizationRun.status == "running", OptimizationRun.requested_at < cutoff)
        .values(status="error", completed_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return res.rowcount or 0
