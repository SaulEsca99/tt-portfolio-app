"""
Router de predicción LSTM: retorna μ y σ esperados para un activo (RF-03).
"""
from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.schemas import CamelModel
from app.core.security import verify_api_key
from app.db.models import Asset, LstmModel, LstmPrediction
from app.db.session import get_db
from app.models.lstm_model import LstmPredictor
from app.services.market_data import load_price_matrix

router = APIRouter(dependencies=[Depends(verify_api_key)])


class PredictRequest(BaseModel):
    ticker: str
    horizon_days: int = 21   # horizonte de predicción (días de trading)


class PredictResponse(CamelModel):
    ticker: str
    model_version: str
    prediction_date: date
    horizon_days: int
    predicted_return: float
    predicted_risk: float


@router.post("", response_model=PredictResponse)
async def predict(
    body: PredictRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Devuelve la predicción de retorno esperado y riesgo (μ, σ) para un activo,
    usando el último modelo LSTM entrenado.

    Si ya existe una predicción del día de hoy para este activo con el modelo
    más reciente, la devuelve sin recalcular (cache).
    """
    ticker = body.ticker.upper().strip()

    # 1. Buscar el activo
    result = await db.execute(select(Asset).where(Asset.ticker == ticker))
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Asset '{ticker}' not found.")

    # 2. Obtener el modelo LSTM más reciente
    result = await db.execute(select(LstmModel).order_by(desc(LstmModel.trained_at)).limit(1))
    model = result.scalar_one_or_none()
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No trained LSTM model available. Wait for the monthly retraining job.",
        )

    # 3. Verificar si ya existe predicción de hoy con este modelo
    today = date.today()
    result = await db.execute(
        select(LstmPrediction).where(
            LstmPrediction.asset_id == asset.id,
            LstmPrediction.lstm_model_id == model.id,
            LstmPrediction.prediction_date == today,
            LstmPrediction.horizon_days == body.horizon_days,
        )
    )
    cached = result.scalar_one_or_none()
    if cached:
        return PredictResponse(
            ticker=asset.ticker,
            model_version=model.version,
            prediction_date=cached.prediction_date,
            horizon_days=cached.horizon_days,
            predicted_return=float(cached.predicted_return),
            predicted_risk=float(cached.predicted_risk),
        )

    # 4. Inferencia con los pesos guardados en la BD (NumPy, sin torch)
    if not model.weights_base64:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="El modelo más reciente no tiene pesos guardados.",
        )
    predictor = LstmPredictor.from_base64(model.weights_base64, model.hyperparameters or {})

    prices = await load_price_matrix(db, [asset.id], align=False)
    if prices.empty:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Sin historial de precios.")
    try:
        out = predictor.predict(prices[asset.ticker].dropna())
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))

    # El modelo predice a su propio horizonte; se escala linealmente al solicitado.
    scale = body.horizon_days / predictor.config.horizon_days
    predicted_return = out["predicted_return"] * scale
    predicted_risk = out["predicted_risk"] * (scale**0.5)

    db.add(
        LstmPrediction(
            id=uuid.uuid4(),
            asset_id=asset.id,
            lstm_model_id=model.id,
            prediction_date=today,
            horizon_days=body.horizon_days,
            predicted_return=Decimal(str(round(predicted_return, 6))),
            predicted_risk=Decimal(str(round(predicted_risk, 6))),
            generated_at=datetime.now(timezone.utc),
        )
    )
    return PredictResponse(
        ticker=asset.ticker,
        model_version=model.version,
        prediction_date=today,
        horizon_days=body.horizon_days,
        predicted_return=predicted_return,
        predicted_risk=predicted_risk,
    )
