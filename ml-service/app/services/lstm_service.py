"""Acceso al modelo LSTM más reciente y cálculo del vector μ para el optimizador."""
from __future__ import annotations

import numpy as np
import pandas as pd
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import LstmModel
from app.models.lstm_model import LstmPredictor

TRADING_DAYS = 252


async def latest_predictor(db: AsyncSession) -> tuple[LstmModel, LstmPredictor] | None:
    model = (
        await db.execute(
            select(LstmModel).where(LstmModel.weights_base64.is_not(None))
            .order_by(desc(LstmModel.trained_at)).limit(1)
        )
    ).scalar_one_or_none()
    if model is None:
        return None
    return model, LstmPredictor.from_base64(model.weights_base64, model.hyperparameters or {})


def lstm_expected_returns(
    predictor: LstmPredictor, prices: pd.DataFrame, mu_hist: np.ndarray | None = None
) -> np.ndarray:
    """
    μ anualizado por activo a partir del retorno log predicho a `horizon_days`:
        μ_raw_i = r̂_i · 252 / horizon_days
    La anualización multiplica el ruido de la predicción (×252/h), de modo que μ_raw puede
    tener una dispersión muy superior a la histórica y dominar al optimizador. Si se
    entrega `mu_hist`, se calibra conservando solo la ordenación relativa del modelo:
        μ̃ = mean(μ_hist) + (μ_raw − mean(μ_raw)) · min(1, std(μ_hist) / std(μ_raw))
    es decir, nunca se amplía la dispersión más allá de la observada históricamente.
    """
    h = predictor.config.horizon_days
    raw = np.array(
        [predictor.predict_return(prices[t].dropna()) * TRADING_DAYS / h for t in prices.columns]
    )
    if mu_hist is None:
        return raw
    mu_hist = np.asarray(mu_hist, dtype=float)
    s_raw, s_hist = float(np.std(raw)), float(np.std(mu_hist))
    if len(raw) < 2 or s_raw < 1e-12:
        return np.full_like(raw, float(np.mean(mu_hist)))
    scale = min(1.0, s_hist / s_raw)
    return float(np.mean(mu_hist)) + (raw - float(np.mean(raw))) * scale
