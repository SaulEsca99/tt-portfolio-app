"""
Descarga de precios usando Alpha Vantage.
Fuente de RESPALDO (cuando yfinance falla) y VALIDACIÓN cruzada.

Límite del plan gratuito: ~25 llamadas/día → usar con parsimonia.
"""
from __future__ import annotations

import logging
from datetime import date

import pandas as pd
import requests

from app.core.config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://www.alphavantage.co/query"


def fetch_prices(ticker: str, compact: bool = True) -> pd.DataFrame:
    """
    Descarga precios diarios ajustados desde Alpha Vantage.

    Args:
        ticker:  Símbolo del activo.
        compact: Si True, devuelve solo los últimos 100 días (ahorra llamadas).
                 Si False, descarga hasta 20 años de historial (outputsize=full).

    Returns:
        DataFrame con columnas: date, open, high, low, close, adj_close, volume.
    """
    if not settings.ALPHA_VANTAGE_API_KEY:
        logger.warning("ALPHA_VANTAGE_API_KEY not set — skipping Alpha Vantage fetch.")
        return pd.DataFrame()

    params = {
        "function": "TIME_SERIES_DAILY_ADJUSTED",
        "symbol": ticker,
        "outputsize": "compact" if compact else "full",
        "apikey": settings.ALPHA_VANTAGE_API_KEY,
    }

    try:
        resp = requests.get(BASE_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as exc:
        logger.error("Alpha Vantage request failed for %s: %s", ticker, exc)
        return pd.DataFrame()

    if "Time Series (Daily)" not in data:
        logger.warning("Unexpected Alpha Vantage response for %s: %s", ticker, data)
        return pd.DataFrame()

    ts = data["Time Series (Daily)"]
    rows = []
    for date_str, values in ts.items():
        rows.append(
            {
                "date": date.fromisoformat(date_str),
                "open": float(values["1. open"]),
                "high": float(values["2. high"]),
                "low": float(values["3. low"]),
                "close": float(values["4. close"]),
                "adj_close": float(values["5. adjusted close"]),
                "volume": int(values["6. volume"]),
            }
        )

    if not rows:
        return pd.DataFrame()

    df = pd.DataFrame(rows).sort_values("date").reset_index(drop=True)
    return df
