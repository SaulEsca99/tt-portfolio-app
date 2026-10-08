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
from app.optimization.portfolio_math import max_feasible_return

ALGORITHMS = {
    "ga": (ga.optimize, ga.GAConfig),
    "pso": (pso.optimize, pso.PSOConfig),
    "de": (de.optimize, de.DEConfig),
}


class ParamError(ValueError):
    """Hiperparámetros inválidos o fuera de rango (el router responde 422)."""


# nombre -> (tipo, mínimo, máximo). Los rangos protegen al servicio (Render free) de valores
# que lo bloquearían o que no tienen sentido para el algoritmo.
LIMITS: dict[str, dict[str, tuple[type, float, float]]] = {
    "ga": {
        "population_size": (int, 10, 500),
        "generations": (int, 10, 1000),
        "mutation_rate": (float, 0.0, 1.0),
        "mutation_sigma": (float, 0.001, 1.0),
        "crossover_rate": (float, 0.0, 1.0),
        "tournament_size": (int, 2, 10),
        "elitism": (int, 0, 50),
    },
    "pso": {
        "num_particles": (int, 10, 500),
        "max_iterations": (int, 10, 1000),
        "inertia_weight": (float, 0.0, 1.2),
        "inertia_end": (float, 0.0, 1.2),
        "stagnation_limit": (int, 5, 1000),
        "cognitive_coeff": (float, 0.0, 4.0),
        "social_coeff": (float, 0.0, 4.0),
        "max_velocity": (float, 0.01, 1.0),
    },
    "de": {
        "population_size": (int, 10, 500),
        "max_generations": (int, 10, 1000),
        "mutation_factor": (float, 0.0, 2.0),
        "crossover_prob": (float, 0.0, 1.0),
    },
}
# (clave de población, clave de iteraciones) por algoritmo, para acotar el costo total
_SIZE_KEYS = {"ga": ("population_size", "generations"),
              "pso": ("num_particles", "max_iterations"),
              "de": ("population_size", "max_generations")}
MAX_EVALUATIONS = 150_000     # población × iteraciones (≈ 4 s en un portátil)
DE_STRATEGIES = {"rand/1/bin"}


def _number(name: str, value, kind: type, lo: float, hi: float):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ParamError(f"'{name}' debe ser numérico.")
    if kind is int:
        if isinstance(value, float) and not value.is_integer():
            raise ParamError(f"'{name}' debe ser un entero.")
        value = int(value)
    else:
        value = float(value)
    if not (lo <= value <= hi):
        raise ParamError(f"'{name}' debe estar entre {lo:g} y {hi:g} (recibido {value:g}).")
    return value


def validate_params(algorithm: str, params: dict | None) -> dict:
    """
    Valida tipos y rangos y devuelve solo las claves que aplican al algoritmo.
    Las claves de otros algoritmos se ignoran (el cliente puede mandar un único dict).
    """
    if algorithm not in ALGORITHMS:
        raise ParamError(f"Algoritmo desconocido: {algorithm!r}")
    params = params or {}
    if not isinstance(params, dict):
        raise ParamError("'params' debe ser un objeto.")

    clean: dict = {}
    for name, (kind, lo, hi) in LIMITS[algorithm].items():
        if name in params and params[name] is not None:
            clean[name] = _number(name, params[name], kind, lo, hi)

    if "seed" in params and params["seed"] is not None:
        clean["seed"] = _number("seed", params["seed"], int, 0, 2**32 - 1)
    if algorithm == "de" and "strategy" in params:
        if params["strategy"] not in DE_STRATEGIES:
            raise ParamError(f"'strategy' debe ser uno de {sorted(DE_STRATEGIES)}.")
        clean["strategy"] = params["strategy"]

    if algorithm == "ga" and clean.get("elitism", 5) > clean.get("population_size", 100) // 2:
        raise ParamError("'elitism' no puede superar la mitad de 'population_size'.")

    pop_key, it_key = _SIZE_KEYS[algorithm]
    pop = clean.get(pop_key, 100)
    its = clean.get(it_key)            # None en DE = automático (depende de N, ≤ 1000)
    if its is not None and pop * its > MAX_EVALUATIONS:
        raise ParamError(
            f"'{pop_key}' × '{it_key}' = {pop * its:,} supera el máximo permitido "
            f"({MAX_EVALUATIONS:,})."
        )
    return clean


def build_config(algorithm: str, params: dict | None):
    """Construye la config del algoritmo a partir de hiperparámetros validados."""
    _, cfg_cls = ALGORITHMS[algorithm]
    valid = {f.name for f in fields(cfg_cls)}
    return cfg_cls(**{k: v for k, v in validate_params(algorithm, params).items() if k in valid})


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

    # Con Sharpe, si ninguna cartera factible supera la tasa libre de riesgo (0), el
    # cociente (negativo) se maximiza con MÁS riesgo: el optimizador elegiría la peor cartera.
    # En ese caso se minimiza la varianza y se informa del cambio.
    effective, fallback = objective, None
    if objective == "sharpe":
        n = len(tickers)
        lo = np.zeros(n) if min_weights is None else np.asarray(min_weights, float)
        hi = np.ones(n) if max_weights is None else np.asarray(max_weights, float)
        best = max_feasible_return(mu, lo, hi)
        if best <= 0.0:
            effective = "min_variance"
            fallback = (
                f"Ninguna cartera factible supera la tasa libre de riesgo "
                f"(retorno esperado máximo {best:+.2%}); se minimizó la varianza."
            )

    res = fn(
        tickers,
        mu,
        sigma,
        risk_aversion=risk_aversion,
        min_weights=min_weights,
        max_weights=max_weights,
        config=build_config(algorithm, params),
        max_assets=max_assets,
        objective=effective,
    )
    res.objective, res.objective_fallback = effective, fallback
    return res
