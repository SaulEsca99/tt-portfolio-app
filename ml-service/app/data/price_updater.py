"""
Job de actualización incremental de precios — Render Cron Job diario.

Estrategia incremental (ver §4.1 del plan):
  Para cada activo en la tabla `asset`, busca el último registro en `price_history`.
  Si `fetched_at` no es de hoy (o no existe), descarga solo el rango faltante.
  Esto mantiene las llamadas a la API en O(n_assets) por día, no full-history.

Se ejecuta vía Render Cron Job:
  schedule: "0 4 * * 2-6"  (04:00 UTC = 22:00 CDMX, martes–sábado)
  startCommand: python -m app.data.price_updater
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import func, select

from app.data import fetch_yfinance, fetch_alpha_vantage
from app.db.models import Asset, PriceHistory
from app.db.session import AsyncSessionLocal

logging.basicConfig(level="INFO", format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


async def update_all_assets() -> None:
    """Punto de entrada del cron job diario."""
    async with AsyncSessionLocal() as db:
        # 1. Obtener todos los activos registrados
        result = await db.execute(select(Asset))
        assets = result.scalars().all()
        logger.info("Updating prices for %d assets", len(assets))

        for asset in assets:
            await _update_asset(db, asset)

        await db.commit()

    logger.info("Daily price update finished.")


async def _update_asset(db, asset: Asset) -> None:
    """Descarga el rango faltante de precios para un activo específico."""
    # Última fecha ya almacenada para este activo
    result = await db.execute(
        select(func.max(PriceHistory.date)).where(PriceHistory.asset_id == asset.id)
    )
    last_date: date | None = result.scalar()

    today = date.today()
    if last_date and last_date >= today:
        logger.debug("Asset %s is up to date (last: %s)", asset.ticker, last_date)
        return

    start = last_date.replace(day=last_date.day + 1) if last_date else today.replace(year=today.year - 5)
    logger.info("Fetching %s from %s to %s", asset.ticker, start, today)

    # Intento primario: yfinance
    df = fetch_yfinance.fetch_prices(asset.ticker, start=start, end=today)

    # Fallback: Alpha Vantage
    if df.empty:
        logger.warning("yfinance empty for %s — trying Alpha Vantage", asset.ticker)
        df = fetch_alpha_vantage.fetch_prices(asset.ticker, compact=True)
        if not df.empty:
            df = df[df["date"] >= start]

    if df.empty:
        logger.error("No data available for %s — skipping", asset.ticker)
        return

    now = datetime.now(timezone.utc)
    source = "yfinance" if not df.empty else "alpha_vantage"

    rows = [
        PriceHistory(
            id=uuid.uuid4(),
            asset_id=asset.id,
            date=row["date"],
            open=row.get("open"),
            high=row.get("high"),
            low=row.get("low"),
            close=row["close"],
            adj_close=row.get("adj_close"),
            volume=row.get("volume"),
            source=source,
            fetched_at=now,
        )
        for _, row in df.iterrows()
    ]

    db.add_all(rows)
    logger.info("Inserted %d rows for %s", len(rows), asset.ticker)


if __name__ == "__main__":
    asyncio.run(update_all_assets())
