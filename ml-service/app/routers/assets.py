"""
Router de activos: registra nuevos tickers y dispara fetch on-demand (RF-01).
"""
from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_api_key
from app.data import fetch_yfinance, fetch_alpha_vantage
from app.db.models import Asset, PriceHistory
from app.db.session import get_db

router = APIRouter(dependencies=[Depends(verify_api_key)])


class FetchAssetRequest(BaseModel):
    ticker: str
    force_full_history: bool = False  # True solo la primera vez


class AssetResponse(BaseModel):
    id: str
    ticker: str
    name: str | None
    asset_type: str | None
    exchange: str | None
    currency: str | None


@router.post("/fetch", response_model=AssetResponse)
async def fetch_asset(
    body: FetchAssetRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Registra un ticker nuevo y descarga su historial completo (primera vez),
    o actualiza los precios faltantes (llamadas subsiguientes).

    Este endpoint es llamado por Next.js cuando el usuario busca un ticker
    que no está en la BD (Flujo 3 del plan de datos §4).
    """
    ticker = body.ticker.upper().strip()

    # 1. Buscar si el activo ya existe
    result = await db.execute(select(Asset).where(Asset.ticker == ticker))
    asset = result.scalar_one_or_none()

    if asset is None:
        # 2. Obtener metadatos del activo
        info = fetch_yfinance.get_asset_info(ticker)
        if not info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ticker '{ticker}' not found.",
            )

        asset = Asset(
            id=uuid.uuid4(),
            ticker=ticker,
            name=info.get("name"),
            asset_type=info.get("asset_type"),
            exchange=info.get("exchange"),
            currency=info.get("currency"),
        )
        db.add(asset)
        await db.flush()  # asigna ID sin commit todavía

    # 3. Determinar qué rango de fechas faltan
    from sqlalchemy import func
    result = await db.execute(
        select(func.max(PriceHistory.date)).where(PriceHistory.asset_id == asset.id)
    )
    last_date: date | None = result.scalar()

    if body.force_full_history or last_date is None:
        start = date(2019, 1, 1)  # 5 años de historial para el LSTM
    else:
        from datetime import timedelta
        start = last_date + timedelta(days=1)

    today = date.today()
    if start > today:
        return AssetResponse(
            id=str(asset.id),
            ticker=asset.ticker,
            name=asset.name,
            asset_type=asset.asset_type,
            exchange=asset.exchange,
            currency=asset.currency,
        )

    # 4. Descargar precios
    df = fetch_yfinance.fetch_prices(ticker, start=start, end=today)
    if df.empty:
        df = fetch_alpha_vantage.fetch_prices(ticker, compact=(not body.force_full_history))

    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not fetch price data for '{ticker}' from any source.",
        )

    now = datetime.now(timezone.utc)
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
            source="yfinance",
            fetched_at=now,
        )
        for _, row in df.iterrows()
    ]
    db.add_all(rows)

    return AssetResponse(
        id=str(asset.id),
        ticker=asset.ticker,
        name=asset.name,
        asset_type=asset.asset_type,
        exchange=asset.exchange,
        currency=asset.currency,
    )
