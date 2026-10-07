"""
Router de backtesting: ejecuta Walk-Forward Analysis (RF-07, RF-08).
"""
from __future__ import annotations

import logging
import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Annotated

import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.backtesting.walk_forward import (
    BacktestMetrics,
    equal_weight_strategy,
    make_markowitz_strategy,
    run_walk_forward,
    series_returns_over,
)
from app.core.security import verify_api_key
from app.db.models import (
    Asset,
    Backtest,
    BacktestEquityPoint,
    OptimizationRun,
    Portfolio,
    PortfolioCandidate,
)
from app.db.session import get_db
from app.optimization.portfolio_math import historical_mean_return, ledoit_wolf_cov
from app.optimization.runner import run_algorithm
from app.services.market_data import load_benchmark_series, load_price_matrix

logger = logging.getLogger(__name__)
router = APIRouter(dependencies=[Depends(verify_api_key)])

DEFAULT_CAPITAL = 10_000.0
BENCHMARK_ALIASES = {"sp500": "SPY", "sp_500": "SPY", "s&p500": "SPY"}


class BacktestRequest(BaseModel):
    optimization_run_id: str
    benchmark: str = "equal_weight"   # "equal_weight" | "markowitz" | "sp500" | ticker
    start_date: date | None = None
    end_date: date | None = None


class EquityPoint(BaseModel):
    date: date
    portfolio_value: float


class MetricsOut(BaseModel):
    sharpe: float
    sortino: float
    max_drawdown: float
    cumulative_return: float
    equity_curve: list[EquityPoint]


class BenchmarkOut(MetricsOut):
    name: str


class BacktestResponse(MetricsOut):
    backtest_id: str
    benchmark: BenchmarkOut
    windows: list[dict]
    # El walk-forward re-estima μ con datos históricos de cada ventana de entrenamiento;
    # el LSTM global no se usa aquí porque estaría entrenado con datos posteriores (look-ahead).
    mu_source: str = "historical"


def _curve(m: BacktestMetrics, capital: float) -> list[EquityPoint]:
    return [
        EquityPoint(date=d.date(), portfolio_value=round(float(v) * capital, 4))
        for d, v in m.equity_curve.items()
    ]


def _persist(db: AsyncSession, run_id: uuid.UUID, name: str, m: BacktestMetrics,
             capital: float, start: date, end: date) -> uuid.UUID:
    bt = Backtest(
        id=uuid.uuid4(),
        optimization_run_id=run_id,
        benchmark_type=name[:30],
        start_date=start,
        end_date=end,
        sharpe=Decimal(str(round(m.sharpe, 6))),
        sortino=Decimal(str(round(m.sortino, 6))),
        max_drawdown=Decimal(str(round(m.max_drawdown, 6))),
        cumulative_return=Decimal(str(round(m.cumulative_return, 6))),
        computed_at=datetime.now(timezone.utc),
    )
    db.add(bt)
    db.add_all(
        BacktestEquityPoint(
            id=uuid.uuid4(), backtest_id=bt.id, date=p.date,
            portfolio_value=Decimal(str(p.portfolio_value)),
        )
        for p in _curve(m, capital)
    )
    return bt.id


@router.post("", response_model=BacktestResponse)
async def run_backtest(
    body: BacktestRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Walk-forward 12/3/3: en cada ventana se re-ejecuta el MISMO algoritmo de la corrida
    de optimización con los datos de entrenamiento y se evalúa fuera de muestra.
    Se guardan dos backtests: "portfolio" (la estrategia) y el benchmark elegido.
    """
    try:
        run_id = uuid.UUID(body.optimization_run_id)
    except ValueError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "optimization_run_id inválido.")

    run = (await db.execute(select(OptimizationRun).where(OptimizationRun.id == run_id))).scalar_one_or_none()
    if run is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Optimization run not found.")
    if run.status != "done":
        raise HTTPException(status.HTTP_409_CONFLICT, "La corrida de optimización no ha terminado.")

    portfolio = (await db.execute(select(Portfolio).where(Portfolio.id == run.portfolio_id))).scalar_one()
    cand_rows = (
        await db.execute(
            select(PortfolioCandidate, Asset)
            .join(Asset, Asset.id == PortfolioCandidate.asset_id)
            .where(PortfolioCandidate.portfolio_id == portfolio.id)
            .order_by(Asset.ticker)
        )
    ).all()

    prices = await load_price_matrix(db, [a.id for _, a in cand_rows])
    if prices.empty or prices.shape[1] < 2:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Sin historial de precios suficiente.")

    tickers = list(prices.columns)
    cand = {a.ticker: c for c, a in cand_rows}
    w_min = np.array([float(cand[t].min_weight or 0.0) for t in tickers])
    w_max = np.array([float(cand[t].max_weight if cand[t].max_weight is not None else 1.0) for t in tickers])
    n = len(tickers)
    max_assets = portfolio.max_assets if portfolio.max_assets and portfolio.max_assets < n else None
    risk_aversion = float(portfolio.risk_aversion_lambda or 1.0)
    params = dict(run.params or {})
    objective = params.pop("objective", "sharpe")

    def optimizer_strategy(train: pd.DataFrame) -> np.ndarray:
        P = train.to_numpy(dtype=float)
        res = run_algorithm(
            run.algorithm, list(train.columns), historical_mean_return(P), ledoit_wolf_cov(P),
            risk_aversion, w_min, w_max, max_assets, params, objective,
        )
        return np.array([res.weights[t] for t in train.columns])

    def compute():
        strat = run_walk_forward(prices, optimizer_strategy, start_date=body.start_date, end_date=body.end_date)
        return strat

    try:
        strat = await run_in_threadpool(compute)
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))

    bench_name = body.benchmark
    start_d = strat.equity_curve.index[1].date()
    end_d = strat.equity_curve.index[-1].date()

    try:
        if bench_name == "equal_weight":
            bench = await run_in_threadpool(
                run_walk_forward, prices, equal_weight_strategy, None, body.start_date, body.end_date)
        elif bench_name == "markowitz":
            bench = await run_in_threadpool(
                run_walk_forward, prices, make_markowitz_strategy(w_min, w_max), None,
                body.start_date, body.end_date)
        else:
            ticker = BENCHMARK_ALIASES.get(bench_name.lower(), bench_name.upper())
            series = await load_benchmark_series(db, ticker, start_d, end_d)
            if series.empty:
                raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                                    f"No hay datos para el benchmark '{bench_name}'.")
            bench = series_returns_over(strat, series)
    except ValueError as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))

    capital = float(portfolio.capital or DEFAULT_CAPITAL)
    strat_id = _persist(db, run.id, "portfolio", strat, capital, start_d, end_d)
    _persist(db, run.id, bench_name, bench, capital, start_d, end_d)

    return BacktestResponse(
        backtest_id=str(strat_id),
        sharpe=strat.sharpe,
        sortino=strat.sortino,
        max_drawdown=strat.max_drawdown,
        cumulative_return=strat.cumulative_return,
        equity_curve=_curve(strat, capital),
        benchmark=BenchmarkOut(
            name=bench_name, sharpe=bench.sharpe, sortino=bench.sortino,
            max_drawdown=bench.max_drawdown, cumulative_return=bench.cumulative_return,
            equity_curve=_curve(bench, capital),
        ),
        windows=strat.windows,
    )
