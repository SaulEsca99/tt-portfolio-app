"""
Algoritmo Genético para optimización de carteras (RF-04, RF-05).

Codificación real: cada individuo es un vector de pesos. Operadores:
  - Selección por torneo
  - Cruce aritmético (combinación convexa) con probabilidad `crossover_rate`
  - Mutación gaussiana por gen con probabilidad `mutation_rate`
  - Elitismo
  - Reparación (cotas, cardinalidad y suma 1) tras cada operador

Referencias del TT: Sección 4.6.2.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np

from app.optimization.common import OptimizationResult, build_result, prepare_bounds
from app.optimization.portfolio_math import fitness, repair

logger = logging.getLogger(__name__)

__all__ = ["GAConfig", "OptimizationResult", "optimize"]


@dataclass
class GAConfig:
    population_size: int = 100
    generations: int = 200
    mutation_rate: float = 0.05
    mutation_sigma: float = 0.1     # desviación de la mutación gaussiana
    crossover_rate: float = 0.8
    tournament_size: int = 3
    elitism: int = 5                # individuos élite que pasan sin cambios
    seed: int | None = 42           # semilla fija por defecto (RNF-07)


def optimize(
    tickers: list[str],
    expected_returns: np.ndarray,
    cov_matrix: np.ndarray,
    risk_aversion: float = 1.0,
    min_weights: np.ndarray | None = None,
    max_weights: np.ndarray | None = None,
    config: GAConfig | None = None,
    max_assets: int | None = None,
    objective: str = "sharpe",
    risk_free: float = 0.0,
) -> OptimizationResult:
    """Encuentra los pesos óptimos con un Algoritmo Genético."""
    config = config or GAConfig()
    n = len(tickers)
    mu = np.asarray(expected_returns, dtype=float)
    sigma = np.asarray(cov_matrix, dtype=float)
    w_min, w_max = prepare_bounds(n, min_weights, max_weights, max_assets)
    rng = np.random.default_rng(config.seed)

    def fit(w: np.ndarray) -> float:
        return fitness(w, mu, sigma, objective, risk_aversion, risk_free)

    def fix(w: np.ndarray) -> np.ndarray:
        return repair(w, w_min, w_max, max_assets)

    pop_size = config.population_size
    pop = np.array([fix(rng.dirichlet(np.ones(n))) for _ in range(pop_size)])
    scores = np.array([fit(w) for w in pop])
    history: list[float] = []
    n_elite = min(config.elitism, pop_size)

    for gen in range(config.generations):
        order = np.argsort(scores)
        pop, scores = pop[order], scores[order]
        history.append(float(-scores[0]) if objective != "min_variance" else float(scores[0]))

        children = [pop[i].copy() for i in range(n_elite)]
        while len(children) < pop_size:
            # selección por torneo de dos padres
            idx = rng.integers(0, pop_size, size=(2, config.tournament_size))
            p1 = pop[idx[0][np.argmin(scores[idx[0]])]]
            p2 = pop[idx[1][np.argmin(scores[idx[1]])]]

            if rng.random() < config.crossover_rate:
                a = rng.random()
                child = a * p1 + (1.0 - a) * p2
            else:
                child = p1.copy()

            mask = rng.random(n) < config.mutation_rate
            if mask.any():
                child = child + mask * rng.normal(0.0, config.mutation_sigma, size=n)

            children.append(fix(child))

        pop = np.array(children)
        scores = np.array([fit(w) for w in pop])

    best = pop[int(np.argmin(scores))]
    logger.info("GA terminó: fitness=%.6f", scores.min())
    return build_result(tickers, best, mu, sigma, history, risk_free)
