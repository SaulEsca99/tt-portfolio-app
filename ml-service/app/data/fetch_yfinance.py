"""
Descarga de precios históricos usando yfinance.
Fuente primaria de datos (RF-01, RF-02).
"""
from __future__ import annotations

import logging
from datetime import date, timedelta

import pandas as pd
import yfinance as yf

logger = logging.getLogger(__name__)


def fetch_prices(
    ticker: str,
    start: date,
    end: date | None = None,
) -> pd.DataFrame:
    """
    Descarga OHLCV + Adj Close para `ticker` en el rango [start, end].

    Args:
        ticker: Símbolo del activo (ej. "AAPL", "MSFT", "^GSPC").
        start:  Fecha de inicio del rango.
        end:    Fecha de fin (inclusive). Por defecto: hoy.

    Returns:
        DataFrame con columnas: date, open, high, low, close, adj_close, volume.
        Vacío si no hay datos.
    """
    end = end or date.today()

    try:
        raw = yf.download(
            ticker,
            start=start.isoformat(),
            # yfinance usa end exclusivo — sumamos 1 día
            end=(end + timedelta(days=1)).isoformat(),
            auto_adjust=False,
            progress=False,
        )
    except Exception as exc:
        logger.error("yfinance error for %s: %s", ticker, exc)
        return pd.DataFrame()

    if raw.empty:
        logger.warning("No data returned by yfinance for %s (%s → %s)", ticker, start, end)
        return pd.DataFrame()

    df = raw.copy()
    df.index.name = "date"
    df = df.reset_index()

    # Normalizar nombres de columnas (yfinance los devuelve capitalizados)
    df.columns = [c[0].lower().replace(" ", "_") if isinstance(c, tuple) else c.lower() for c in df.columns]

    rename_map = {
        "adj_close": "adj_close",
        "adj close": "adj_close",
    }
    df = df.rename(columns=rename_map)

    cols = ["date", "open", "high", "low", "close", "adj_close", "volume"]
    available = [c for c in cols if c in df.columns]

    return df[available]


def get_asset_info(ticker: str) -> dict:
    """
    Devuelve metadatos del activo: nombre, tipo, exchange, moneda.
    Se usa al registrar un ticker nuevo en la tabla `asset`.
    """
    try:
        info = yf.Ticker(ticker).info
        return {
            "ticker": ticker.upper(),
            "name": info.get("longName") or info.get("shortName") or ticker,
            "asset_type": info.get("quoteType", "").lower(),  # equity, etf, crypto…
            "exchange": info.get("exchange"),
            "currency": info.get("currency"),
        }
    except Exception as exc:
        logger.error("Could not fetch info for %s: %s", ticker, exc)
        return {"ticker": ticker.upper(), "name": ticker}
