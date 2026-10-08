"""
Walk-Forward Analysis (Backtesting) — Sección 4.6.4 del TT.

Metodología (ventana deslizante, fuera de muestra):
    [t - train_months, t)  → la estrategia estima pesos SOLO con estos datos
    [t, t + test_months)   → se aplican esos pesos (rebalanceo diario a pesos
                              constantes dentro de la ventana de prueba)
    t ← t + step_months    → se repite

Los retornos fuera de muestra de todas las ventanas se concatenan en una serie
continua sobre la que se calculan las métricas. Ningún dato de la ventana de
prueba se usa para decidir los pesos de esa ventana (sin look-ahead).

Métricas (rf = 0, 252 días de trading al año):
  - Sharpe   = media(r) / desv(r) · √252
  - Sortino  = media(r) · 252 / (desv. a la baja · √252)
  - Maximum drawdown = mín(equity / máx. acumulado − 1)
  - Retorno acumulado = equity_final / equity_inicial − 1
"""
from __future__ import annotations

import logging
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import date

import numpy as np
import pandas as pd
from scipy.optimize import minimize

from app.optimization.portfolio_math import (
    historical_mean_return,
    ledoit_wolf_cov,
    repair,
    sharpe_ratio,
)

logger = logging.getLogger(__name__)

TRADING_DAYS = 252

# Una estrategia recibe los precios de entrenamiento (T × N) y las columnas, y
# devuelve el vector de pesos (N,) que suma 1.
Strategy = Callable[[pd.DataFrame], np.ndarray]


@dataclass
class WalkForwardConfig:
    train_months: int = 12    # tamaño de la ventana de entrenamiento (meses)
    test_months: int = 3      # tamaño de la ventana de prueba (meses)
    step_months: int = 3      # desplazamiento entre ventanas
    min_train_obs: int = 120  # mínimo de observaciones diarias para entrenar


@dataclass
class BacktestMetrics:
    sharpe: float
    sortino: float
    max_drawdown: float
    cumulative_return: float
    equity_curve: pd.Series = field(default_factory=pd.Series)   # fecha → valor (base 1.0)
    windows: list[dict] = field(default_factory=list)            # pesos y fechas por ventana
    avg_turnover: float = 0.0     # rotación media por rebalanceo (Σ|Δw|, 1.0 = compra inicial)
    cost_bps: float = 0.0


# ---------------------------------------------------------------------------
# Métricas
# ---------------------------------------------------------------------------

def compute_metrics(returns: pd.Series) -> BacktestMetrics:
    """Calcula las métricas sobre una serie de retornos diarios simples."""
    r = returns.dropna().astype(float)
    if len(r) < 2:
        raise ValueError("Se necesitan al menos 2 retornos para calcular métricas.")

    equity = (1.0 + r).cumprod()
    equity = pd.concat([pd.Series([1.0], index=[r.index[0] - pd.Timedelta(days=1)]), equity])

    std = r.std(ddof=1)
    sharpe = float(r.mean() / std * np.sqrt(TRADING_DAYS)) if std > 1e-12 else 0.0

    downside = np.sqrt(np.mean(np.minimum(r.to_numpy(), 0.0) ** 2))
    sortino = float(r.mean() * TRADING_DAYS / (downside * np.sqrt(TRADING_DAYS))) if downside > 1e-12 else 0.0

    drawdown = equity / equity.cummax() - 1.0
    return BacktestMetrics(
        sharpe=sharpe,
        sortino=sortino,
        max_drawdown=float(drawdown.min()),
        cumulative_return=float(equity.iloc[-1] - 1.0),
        equity_curve=equity,
    )


# ---------------------------------------------------------------------------
# Walk-forward
# ---------------------------------------------------------------------------

def run_walk_forward(
    prices: pd.DataFrame,                  # índice = fecha, columnas = ticker
    strategy: Strategy,
    config: WalkForwardConfig | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    cost_bps: float = 0.0,
) -> BacktestMetrics:
    """
    Evalúa una estrategia con Walk-Forward Analysis.

    Args:
        prices:     Precios ajustados en formato ancho.
        strategy:   Función que mapea precios de entrenamiento → pesos.
        config:     Tamaños de ventana (12/3/3 por defecto).
        start_date: Primer día de evaluación fuera de muestra (opcional).
        end_date:   Último día de evaluación (opcional).
        cost_bps:   Costo de transacción en puntos base por unidad rotada (Σ|Δw|); se descuenta
                    del primer día de cada ventana, incluida la compra inicial (rotación 1.0).
                    No modela el rebalanceo diario interno de la ventana.

    Returns:
        BacktestMetrics con la curva de equity fuera de muestra y los pesos por ventana.
    """
    config = config or WalkForwardConfig()
    prices = prices.sort_index()
    rets = prices.pct_change()
    idx = prices.index

    first_possible = idx[0] + pd.DateOffset(months=config.train_months)
    t = max(first_possible, pd.Timestamp(start_date)) if start_date else first_possible
    stop = min(idx[-1], pd.Timestamp(end_date)) if end_date else idx[-1]

    pieces: list[pd.Series] = []
    windows: list[dict] = []
    turnovers: list[float] = []
    w_prev = np.zeros(prices.shape[1])

    while t < stop:
        t_end = min(t + pd.DateOffset(months=config.test_months), stop + pd.Timedelta(days=1))
        train = prices.loc[(idx >= t - pd.DateOffset(months=config.train_months)) & (idx < t)]
        test_mask = (idx >= t) & (idx < t_end)

        if len(train) >= config.min_train_obs and test_mask.any():
            w = np.asarray(strategy(train), dtype=float)
            if w.shape != (prices.shape[1],) or abs(w.sum() - 1.0) > 1e-6:
                raise ValueError("La estrategia debe devolver pesos (N,) que sumen 1.")
            window_ret = rets.loc[test_mask].fillna(0.0) @ w
            turnover = float(np.abs(w - w_prev).sum())
            window_ret.iloc[0] -= turnover * cost_bps / 1e4
            turnovers.append(turnover)
            w_prev = w
            pieces.append(window_ret)
            windows.append({
                "train_start": train.index[0].date().isoformat(),
                "test_start": window_ret.index[0].date().isoformat(),
                "test_end": window_ret.index[-1].date().isoformat(),
                "weights": {c: float(x) for c, x in zip(prices.columns, w)},
                "turnover": turnover,
            })
        else:
            logger.warning("Ventana omitida en %s: datos insuficientes.", t.date())

        t = t + pd.DateOffset(months=config.step_months)

    if not pieces:
        raise ValueError("Historial insuficiente para ejecutar el walk-forward.")

    metrics = compute_metrics(pd.concat(pieces))
    metrics.windows = windows
    metrics.avg_turnover = float(np.mean(turnovers))
    metrics.cost_bps = cost_bps
    return metrics


def series_returns_over(metrics: BacktestMetrics, series_prices: pd.Series,
                        cost_bps: float = 0.0) -> BacktestMetrics:
    """Métricas de un único activo (p. ej. SPY) sobre el mismo periodo OOS de `metrics`."""
    eq_idx = metrics.equity_curve.index[1:]
    r = series_prices.sort_index().pct_change().reindex(eq_idx).dropna()
    if len(r):
        r.iloc[0] -= cost_bps / 1e4          # compra inicial (rotación 1.0)
    out = compute_metrics(r)
    out.avg_turnover, out.cost_bps = 1.0, cost_bps
    return out


# ---------------------------------------------------------------------------
# Estrategias de referencia (benchmarks)
# ---------------------------------------------------------------------------

def equal_weight_strategy(train: pd.DataFrame) -> np.ndarray:
    """Portafolio 1/N."""
    n = train.shape[1]
    return np.full(n, 1.0 / n)


def make_markowitz_strategy(
    w_min: np.ndarray | None = None,
    w_max: np.ndarray | None = None,
    risk_free: float = 0.0,
) -> Strategy:
    """Markowitz clásico: máximo Sharpe con SLSQP, μ histórico y Σ Ledoit-Wolf."""

    def strategy(train: pd.DataFrame) -> np.ndarray:
        P = train.to_numpy(dtype=float)
        n = P.shape[1]
        mu, sigma = historical_mean_return(P), ledoit_wolf_cov(P)
        lo = np.zeros(n) if w_min is None else w_min
        hi = np.ones(n) if w_max is None else w_max
        x0 = repair(np.full(n, 1.0 / n), lo, hi)
        res = minimize(
            lambda w: -sharpe_ratio(w, mu, sigma, risk_free),
            x0,
            method="SLSQP",
            bounds=list(zip(lo, hi)),
            constraints=[{"type": "eq", "fun": lambda w: w.sum() - 1.0}],
            options={"maxiter": 200, "ftol": 1e-10},
        )
        w = res.x if res.success else x0
        return repair(w, lo, hi)

    return strategy
