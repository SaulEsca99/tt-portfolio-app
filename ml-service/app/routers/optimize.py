"""
Router de optimización: ejecuta GA/PSO/DE según la selección del usuario (RF-04, RF-05, RF-09).
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Annotated, Literal

import numpy as np
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.schemas import CamelModel
from app.core.security import verify_api_key
from app.db.models import (
    Asset,
    OptimizationResult,
    OptimizationRun,
    Portfolio,
    PortfolioCandidate,
)
from app.db.session import get_db
from app.optimization.portfolio_math import historical_mean_return, ledoit_wolf_cov
from app.optimization.runner import ParamError, run_algorithm, validate_params
from app.services.lstm_service import latest_predictor, lstm_expected_returns
from app.services.market_data import MIN_OBSERVATIONS, load_price_matrix, prepare_universe

logger = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(verify_api_key)])

MIN_WEIGHT_REPORTED = 1e-6


class OptimizeRequest(BaseModel):
    portfolio_id: str
    algorithm: Literal["ga", "pso", "de"] = "ga"
    objective: Literal["sharpe", "min_variance", "utility"] = "sharpe"
    # Origen del vector μ: histórico, LSTM, o mezcla 50/50 (más estable que el LSTM puro)
    mu_source: Literal["historical", "lstm", "blend"] = "historical"
    params: dict = Field(default_factory=dict)  # hiperparámetros opcionales del algoritmo


class WeightResult(CamelModel):
    ticker: str
    weight: float


class OptimizeResponse(CamelModel):
    optimization_run_id: str
    algorithm: str
    objective: str
    mu_source: str
    weights: list[WeightResult]
    expected_return: float
    expected_risk: float
    sharpe_ratio: float
    convergence_history: list[float]
    # Activos candidatos que no entraron a la optimización, con el motivo
    excluded: dict[str, str] = Field(default_factory=dict)
    n_observations: int = 0
    # Si el objetivo solicitado no se pudo usar (p. ej. Sharpe con μ ≤ 0), motivo del cambio
    objective_fallback: str | None = None


@router.post("", response_model=OptimizeResponse)
async def run_optimization(
    body: OptimizeRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Flujo:
      1. Leer el portafolio y sus candidatos desde la BD
      2. Cargar precios históricos (diarios, 5 años) de cada candidato
      3. Estimar μ (histórico; el LSTM se integra en la Fase 5) y Σ (Ledoit-Wolf)
      4. Ejecutar GA/PSO/DE
      5. Guardar el resultado en optimization_run + optimization_result
      6. Retornar los pesos al frontend de Next.js
    """
    try:
        portfolio_id = uuid.UUID(body.portfolio_id)
    except ValueError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "portfolio_id inválido.")
    try:
        body.params = validate_params(body.algorithm, body.params)   # antes de tocar la BD
    except ParamError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))

    portfolio = (
        await db.execute(select(Portfolio).where(Portfolio.id == portfolio_id))
    ).scalar_one_or_none()
    if portfolio is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Portfolio not found.")

    cand_rows = (
        await db.execute(
            select(PortfolioCandidate, Asset)
            .join(Asset, Asset.id == PortfolioCandidate.asset_id)
            .where(PortfolioCandidate.portfolio_id == portfolio_id)
            .order_by(Asset.ticker)
        )
    ).all()
    if len(cand_rows) < 2:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "La cartera necesita al menos 2 activos candidatos.",
        )

    run = OptimizationRun(
        id=uuid.uuid4(),
        portfolio_id=portfolio_id,
        algorithm=body.algorithm,
        status="running",
        params={"objective": body.objective, **(body.params or {})},
        requested_at=datetime.now(timezone.utc),
    )
    db.add(run)
    await db.flush()

    async def fail(code: int, detail: str):
        run.status = "error"
        run.completed_at = datetime.now(timezone.utc)
        await db.commit()  # persistir el estado de error antes de responder
        raise HTTPException(code, detail)

    tickers = [a.ticker for _, a in cand_rows]
    asset_by_ticker = {a.ticker: a for _, a in cand_rows}
    wide = await load_price_matrix(db, [a.id for _, a in cand_rows], align=False)
    prices, excluded = prepare_universe(wide, tickers)

    if prices.empty or prices.shape[1] < 2 or len(prices) < MIN_OBSERVATIONS + 1:
        await fail(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Historial de precios insuficiente. Descarga los datos con /assets/fetch."
            + (f" Excluidos: {excluded}" if excluded else ""),
        )

    tickers = list(prices.columns)  # activos con datos
    cand_by_ticker = {a.ticker: c for c, a in cand_rows}
    P = prices.to_numpy(dtype=float)

    try:
        mu = historical_mean_return(P)
        sigma = ledoit_wolf_cov(P)
    except ValueError as exc:
        await fail(status.HTTP_422_UNPROCESSABLE_ENTITY, f"Datos de precios inválidos: {exc}")
    mu_source = "historical"

    if body.mu_source != "historical":
        found = await latest_predictor(db)
        if found is None:
            await fail(status.HTTP_409_CONFLICT,
                       "No hay un modelo LSTM entrenado; usa mu_source='historical'.")
        model, predictor = found
        try:
            mu_lstm = lstm_expected_returns(predictor, prices, mu)
        except ValueError as exc:
            await fail(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))
        mu = mu_lstm if body.mu_source == "lstm" else 0.5 * mu_lstm + 0.5 * mu
        mu_source = f"{body.mu_source}:{model.version}"

    n = len(tickers)
    w_min = np.array([float(cand_by_ticker[t].min_weight or 0.0) for t in tickers])
    w_max = np.array([float(cand_by_ticker[t].max_weight if cand_by_ticker[t].max_weight is not None else 1.0) for t in tickers])
    risk_aversion = float(portfolio.risk_aversion_lambda or 1.0)
    max_assets = portfolio.max_assets if portfolio.max_assets and portfolio.max_assets < n else None

    try:
        res = await run_in_threadpool(
            run_algorithm,
            body.algorithm,
            tickers,
            mu,
            sigma,
            risk_aversion,
            w_min,
            w_max,
            max_assets,
            body.params,
            body.objective,
        )
    except ValueError as exc:  # restricciones infactibles
        await fail(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))
    except Exception:
        logger.exception("Fallo inesperado en la optimización")
        await fail(status.HTTP_500_INTERNAL_SERVER_ERROR, "Error interno en la optimización.")

    for ticker, weight in res.weights.items():
        if weight > MIN_WEIGHT_REPORTED:
            db.add(
                OptimizationResult(
                    id=uuid.uuid4(),
                    optimization_run_id=run.id,
                    asset_id=asset_by_ticker[ticker].id,
                    weight=round(weight, 6),
                )
            )
    run.status = "done"
    run.completed_at = datetime.now(timezone.utc)
    run.params = {**run.params, "mu_source": mu_source, "max_assets": max_assets,
                  "excluded": excluded, "n_observations": int(len(prices)),
                  "objective_effective": res.objective, "objective_fallback": res.objective_fallback}

    return OptimizeResponse(
        optimization_run_id=str(run.id),
        algorithm=body.algorithm,
        objective=res.objective,
        mu_source=mu_source,
        weights=[
            WeightResult(ticker=t, weight=w)
            for t, w in sorted(res.weights.items(), key=lambda kv: -kv[1])
            if w > MIN_WEIGHT_REPORTED
        ],
        expected_return=res.expected_return,
        expected_risk=res.expected_risk,
        sharpe_ratio=res.sharpe_ratio,
        convergence_history=res.convergence_history,
        excluded=excluded,
        n_observations=int(len(prices)),
        objective_fallback=res.objective_fallback,
    )
