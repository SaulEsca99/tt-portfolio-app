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


def lstm_expected_returns(predictor: LstmPredictor, prices: pd.DataFrame) -> np.ndarray:
    """
    μ anualizado por activo a partir del retorno log predicho a `horizon_days`:
        μ_i = r̂_i · 252 / horizon_days
    Nota: la anualización amplifica el ruido de la predicción; por eso el router
    ofrece la mezcla ("blend") con el μ histórico como alternativa más estable.
    """
    h = predictor.config.horizon_days
    return np.array(
        [predictor.predict_return(prices[t].dropna()) * TRADING_DAYS / h for t in prices.columns]
    )
