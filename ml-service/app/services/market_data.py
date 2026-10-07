"""
Carga de precios desde la BD en formato ancho (fecha × ticker).
Unifica la frecuencia a DIARIA y la ventana a 5 años por defecto (consistente con
el notebook y con la anualización de 252 días).
"""
from __future__ import annotations

import uuid
from datetime import date, timedelta

import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Asset, PriceHistory

MIN_OBSERVATIONS = 60  # mínimo de retornos para estimar μ y Σ de forma razonable


async def load_price_matrix(
    db: AsyncSession,
    asset_ids: list[uuid.UUID],
    start: date | None = None,
    end: date | None = None,
    years: int = 5,
    align: bool = True,
) -> pd.DataFrame:
    """
    Devuelve un DataFrame (index=fecha, columns=ticker) con precios ajustados.
    Usa adj_close y, si falta, close. Rellena huecos cortos hacia adelante
    (máx. 3 días). Con align=True descarta fechas con datos faltantes en algún activo;
    con align=False conserva los NaN (útil para entrenar con historiales de distinta longitud).
    """
    end = end or date.today()
    start = start or (end - timedelta(days=365 * years))

    stmt = (
        select(
            PriceHistory.date,
            Asset.ticker,
            PriceHistory.adj_close,
            PriceHistory.close,
        )
        .join(Asset, Asset.id == PriceHistory.asset_id)
        .where(
            PriceHistory.asset_id.in_(asset_ids),
            PriceHistory.date >= start,
            PriceHistory.date <= end,
        )
        .order_by(PriceHistory.date)
    )
    rows = (await db.execute(stmt)).all()
    if not rows:
        return pd.DataFrame()

    df = pd.DataFrame(rows, columns=["date", "ticker", "adj_close", "close"])
    df["price"] = df["adj_close"].fillna(df["close"]).astype(float)
    wide = df.pivot_table(index="date", columns="ticker", values="price", aggfunc="last")
    wide.index = pd.to_datetime(wide.index)
    wide = wide.sort_index().ffill(limit=3)
    return wide.dropna(how="any") if align else wide


async def load_benchmark_series(
    db: AsyncSession,
    ticker: str,
    start: date,
    end: date,
) -> pd.Series:
    """
    Serie de precios de un benchmark (p. ej. SPY). Primero busca en la BD; si el
    activo no está registrado o no tiene datos, lo descarga de yfinance sin persistirlo.
    """
    from fastapi.concurrency import run_in_threadpool

    from app.data import fetch_yfinance

    asset = (await db.execute(select(Asset).where(Asset.ticker == ticker))).scalar_one_or_none()
    if asset is not None:
        wide = await load_price_matrix(db, [asset.id], start=start, end=end)
        if not wide.empty:
            return wide[ticker]

    df = await run_in_threadpool(fetch_yfinance.fetch_prices, ticker, start, end)
    if df.empty:
        return pd.Series(dtype=float)
    price = df["adj_close"] if "adj_close" in df.columns else df["close"]
    s = pd.Series(price.astype(float).to_numpy(), index=pd.to_datetime(df["date"]))
    return s.sort_index()
