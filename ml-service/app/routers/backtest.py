"""
Router de backtesting: ejecuta Walk-Forward Analysis (RF-07, RF-08).
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
from app.db.models import Backtest, BacktestEquityPoint, OptimizationRun
from app.db.session import get_db

router = APIRouter(dependencies=[Depends(verify_api_key)])


class BacktestRequest(BaseModel):
    optimization_run_id: str
    benchmark: str = "equal_weight"   # "equal_weight" | "sp500" | ticker
    start_date: date | None = None
    end_date: date | None = None


class EquityPoint(BaseModel):
    date: date
    portfolio_value: float


class BacktestResponse(BaseModel):
    backtest_id: str
    sharpe: float
    sortino: float
    max_drawdown: float
    cumulative_return: float
    equity_curve: list[EquityPoint]


@router.post("", response_model=BacktestResponse)
async def run_backtest(
    body: BacktestRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Ejecuta Walk-Forward Analysis para una corrida de optimización dada.

    Flujo:
      1. Cargar optimization_run y sus pesos (optimization_result)
      2. Cargar price_history de los activos del portafolio
      3. Ejecutar walk_forward.run_walk_forward()
      4. Guardar backtest + backtest_equity_point en la BD
      5. Retornar métricas y curva de equity
    """
    run_id = uuid.UUID(body.optimization_run_id)

    result = await db.execute(select(OptimizationRun).where(OptimizationRun.id == run_id))
    run = result.scalar_one_or_none()
    if run is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Optimization run not found.")

    raise NotImplementedError(
        "TODO: implementar backtesting completo. "
        "Ver walk_forward.py y Sección 4.6.4 del TT."
    )
