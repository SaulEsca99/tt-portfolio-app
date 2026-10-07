"""
Despacho de algoritmos (Strategy): único punto que conoce GA, PSO y DE.
Función pura (sin BD), reutilizada por el router de optimización y por el
walk-forward del backtesting.
"""
from __future__ import annotations

from dataclasses import fields

import numpy as np

from app.optimization import de, ga, pso
from app.optimization.common import OptimizationResult

ALGORITHMS = {
    "ga": (ga.optimize, ga.GAConfig),
    "pso": (pso.optimize, pso.PSOConfig),
    "de": (de.optimize, de.DEConfig),
}


def build_config(algorithm: str, params: dict | None):
    """Construye la config del algoritmo ignorando claves desconocidas."""
    _, cfg_cls = ALGORITHMS[algorithm]
    valid = {f.name for f in fields(cfg_cls)}
    return cfg_cls(**{k: v for k, v in (params or {}).items() if k in valid})


def run_algorithm(
    algorithm: str,
    tickers: list[str],
    mu: np.ndarray,
    sigma: np.ndarray,
    risk_aversion: float = 1.0,
    min_weights: np.ndarray | None = None,
    max_weights: np.ndarray | None = None,
    max_assets: int | None = None,
    params: dict | None = None,
    objective: str = "sharpe",
) -> OptimizationResult:
    if algorithm not in ALGORITHMS:
        raise ValueError(f"Algoritmo desconocido: {algorithm!r}")
    fn, _ = ALGORITHMS[algorithm]
    return fn(
        tickers,
        mu,
        sigma,
        risk_aversion=risk_aversion,
        min_weights=min_weights,
        max_weights=max_weights,
        config=build_config(algorithm, params),
        max_assets=max_assets,
        objective=objective,
    )
