"""
Tipos y utilidades comunes a GA, PSO y DE: resultado unificado, preparación de
límites y construcción del resultado final.
"""
from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

from app.optimization.portfolio_math import (
    portfolio_return,
    portfolio_std,
    sharpe_ratio,
)


@dataclass
class OptimizationResult:
    weights: dict[str, float]     # {"AAPL": 0.35, "MSFT": 0.25, ...}
    expected_return: float
    expected_risk: float
    sharpe_ratio: float
    convergence_history: list[float] = field(default_factory=list)
    objective: str = "sharpe"                    # objetivo realmente optimizado
    objective_fallback: str | None = None        # motivo si difiere del solicitado


def prepare_bounds(
    n: int,
    min_weights: np.ndarray | None,
    max_weights: np.ndarray | None,
    max_assets: int | None,
) -> tuple[np.ndarray, np.ndarray]:
    """Valida y normaliza los límites por activo; verifica factibilidad."""
    w_min = np.zeros(n) if min_weights is None else np.asarray(min_weights, dtype=float)
    w_max = np.ones(n) if max_weights is None else np.asarray(max_weights, dtype=float)
    if w_min.shape != (n,) or w_max.shape != (n,):
        raise ValueError("min_weights / max_weights deben tener longitud N.")
    if np.any(w_min > w_max):
        raise ValueError("min_weights no puede exceder max_weights.")
    if w_max.sum() < 1.0 - 1e-9:
        raise ValueError("Infactible: la suma de pesos máximos es < 1.")
    if w_min.sum() > 1.0 + 1e-9:
        raise ValueError("Infactible: la suma de pesos mínimos es > 1.")
    if max_assets is not None:
        if max_assets < 1:
            raise ValueError("max_assets debe ser >= 1.")
        # los K activos con mayor cota superior deben poder sumar 1
        if np.sort(w_max)[::-1][:max_assets].sum() < 1.0 - 1e-9:
            raise ValueError("Infactible: max_assets es demasiado bajo para los pesos máximos dados.")
    return w_min, w_max


def build_result(
    tickers: list[str],
    w: np.ndarray,
    mu: np.ndarray,
    sigma: np.ndarray,
    history: list[float],
    risk_free: float = 0.0,
) -> OptimizationResult:
    return OptimizationResult(
        weights={t: float(x) for t, x in zip(tickers, w)},
        expected_return=portfolio_return(w, mu),
        expected_risk=portfolio_std(w, sigma),
        sharpe_ratio=float(sharpe_ratio(w, mu, sigma, risk_free)),
        convergence_history=history,
    )
