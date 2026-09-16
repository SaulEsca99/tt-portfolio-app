"""
Router de optimización: ejecuta GA/PSO/DE según la selección del usuario (RF-04, RF-05, RF-09).
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_api_key
from app.db.models import OptimizationRun, OptimizationResult, Portfolio
from app.db.session import get_db

router = APIRouter(dependencies=[Depends(verify_api_key)])


class OptimizeRequest(BaseModel):
    portfolio_id: str
    algorithm: Literal["ga", "pso", "de"] = "ga"
    params: dict = Field(default_factory=dict)  # hiperparámetros opcionales del algoritmo


class WeightResult(BaseModel):
    ticker: str
    weight: float


class OptimizeResponse(BaseModel):
    optimization_run_id: str
    algorithm: str
    weights: list[WeightResult]
    expected_return: float
    expected_risk: float
    sharpe_ratio: float


@router.post("", response_model=OptimizeResponse)
async def run_optimization(
    body: OptimizeRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Ejecuta el algoritmo de optimización seleccionado para el portafolio dado.

    Flujo:
      1. Leer el portafolio y sus candidatos desde la BD
      2. Cargar precios históricos de cada candidato
      3. Cargar predicciones LSTM (μ, σ) del modelo más reciente
      4. Ejecutar GA/PSO/DE
      5. Guardar el resultado en optimization_run + optimization_result
      6. Retornar los pesos al frontend de Next.js
    """
    portfolio_id = uuid.UUID(body.portfolio_id)

    # Verificar que el portafolio existe
    result = await db.execute(select(Portfolio).where(Portfolio.id == portfolio_id))
    portfolio = result.scalar_one_or_none()
    if portfolio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found.")

    # Crear registro de la corrida (status: pending)
    run = OptimizationRun(
        id=uuid.uuid4(),
        portfolio_id=portfolio_id,
        algorithm=body.algorithm,
        status="pending",
        params=body.params or {},
        requested_at=datetime.now(timezone.utc),
    )
    db.add(run)
    await db.flush()

    # TODO: implementar el flujo completo de optimización.
    # Por ahora lanza NotImplementedError para que el test lo detecte temprano.
    raise NotImplementedError(
        "TODO: cargar precios, inferir LSTM, ejecutar algoritmo y guardar resultados. "
        "Ver Flujo 3 en §4 del plan de desarrollo."
    )
