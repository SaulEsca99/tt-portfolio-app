"""
Differential Evolution para optimización de carteras (RF-04, RF-05).

Estrategia DE/rand/1/bin con selección voraz uno a uno. Cada vector de prueba se
repara (cotas, cardinalidad, suma 1) antes de evaluarse.
Referencias del TT: Sección 4.6.4.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np

from app.optimization.common import OptimizationResult, build_result, prepare_bounds
from app.optimization.portfolio_math import fitness, repair

logger = logging.getLogger(__name__)

__all__ = ["DEConfig", "OptimizationResult", "optimize"]


@dataclass
class DEConfig:
    population_size: int = 100
    max_generations: int = 200
    mutation_factor: float = 0.8     # F — escala la diferencia entre individuos
    crossover_prob: float = 0.7      # CR — probabilidad de recombinación
    strategy: str = "rand/1/bin"     # estrategia clásica de DE
    seed: int | None = 42            # semilla fija por defecto (RNF-07)


def optimize(
    tickers: list[str],
    expected_returns: np.ndarray,
    cov_matrix: np.ndarray,
    risk_aversion: float = 1.0,
    min_weights: np.ndarray | None = None,
    max_weights: np.ndarray | None = None,
    config: DEConfig | None = None,
    max_assets: int | None = None,
    objective: str = "sharpe",
    risk_free: float = 0.0,
) -> OptimizationResult:
    """Encuentra los pesos óptimos con Differential Evolution (rand/1/bin)."""
    config = config or DEConfig()
    if config.strategy != "rand/1/bin":
        raise ValueError("Solo se soporta la estrategia 'rand/1/bin'.")

    n = len(tickers)
    mu = np.asarray(expected_returns, dtype=float)
    sigma = np.asarray(cov_matrix, dtype=float)
    w_min, w_max = prepare_bounds(n, min_weights, max_weights, max_assets)
    rng = np.random.default_rng(config.seed)

    def fit(w: np.ndarray) -> float:
        return fitness(w, mu, sigma, objective, risk_aversion, risk_free)

    def fix(w: np.ndarray) -> np.ndarray:
        return repair(w, w_min, w_max, max_assets)

    np_ = max(config.population_size, 4)
    pop = np.array([fix(rng.dirichlet(np.ones(n))) for _ in range(np_)])
    scores = np.array([fit(w) for w in pop])
    history: list[float] = []

    for gen in range(config.max_generations):
        for i in range(np_):
            candidates = [j for j in range(np_) if j != i]
            a, b, c = pop[rng.choice(candidates, size=3, replace=False)]
            mutant = a + config.mutation_factor * (b - c)

            cross = rng.random(n) < config.crossover_prob
            cross[rng.integers(0, n)] = True        # al menos un gen del mutante
            trial = fix(np.where(cross, mutant, pop[i]))

            s = fit(trial)
            if s <= scores[i]:
                pop[i], scores[i] = trial, s

        best_score = float(scores.min())
        history.append(best_score if objective == "min_variance" else -best_score)

    best = pop[int(np.argmin(scores))]
    logger.info("DE terminó: fitness=%.6f", scores.min())
    return build_result(tickers, best, mu, sigma, history, risk_free)
