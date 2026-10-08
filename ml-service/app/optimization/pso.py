"""
Particle Swarm Optimization para optimización de carteras (RF-04, RF-05).

PSO global-best con inercia. La posición de cada partícula se proyecta al conjunto
factible (cotas, cardinalidad, suma 1) tras cada actualización. Misma firma que
ga.optimize() y de.optimize() — intercambiables desde el router.
Referencias del TT: Sección 4.6.3.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np

from app.optimization.common import OptimizationResult, build_result, prepare_bounds
from app.optimization.portfolio_math import fitness, repair

logger = logging.getLogger(__name__)

__all__ = ["PSOConfig", "OptimizationResult", "optimize"]


@dataclass
class PSOConfig:
    num_particles: int = 100
    max_iterations: int = 200
    inertia_weight: float = 0.9       # w inicial; decae linealmente hasta inertia_end
    inertia_end: float = 0.4          # w final (explotación)
    stagnation_limit: int = 25        # iteraciones sin mejora antes de reinicializar el peor 50 %
    cognitive_coeff: float = 1.5      # c1 (pbest)
    social_coeff: float = 1.5         # c2 (gbest)
    max_velocity: float = 0.3         # tope de |v| por dimensión
    seed: int | None = 42             # semilla fija por defecto (RNF-07)


def optimize(
    tickers: list[str],
    expected_returns: np.ndarray,
    cov_matrix: np.ndarray,
    risk_aversion: float = 1.0,
    min_weights: np.ndarray | None = None,
    max_weights: np.ndarray | None = None,
    config: PSOConfig | None = None,
    max_assets: int | None = None,
    objective: str = "sharpe",
    risk_free: float = 0.0,
) -> OptimizationResult:
    """Encuentra los pesos óptimos con PSO."""
    config = config or PSOConfig()
    n = len(tickers)
    mu = np.asarray(expected_returns, dtype=float)
    sigma = np.asarray(cov_matrix, dtype=float)
    w_min, w_max = prepare_bounds(n, min_weights, max_weights, max_assets)
    rng = np.random.default_rng(config.seed)

    def fit(w: np.ndarray) -> float:
        return fitness(w, mu, sigma, objective, risk_aversion, risk_free)

    def fix(w: np.ndarray) -> np.ndarray:
        return repair(w, w_min, w_max, max_assets)

    m = config.num_particles
    pos = np.array([fix(rng.dirichlet(np.ones(n))) for _ in range(m)])
    vel = rng.uniform(-0.05, 0.05, size=(m, n))
    scores = np.array([fit(p) for p in pos])

    pbest, pbest_score = pos.copy(), scores.copy()
    g = int(np.argmin(scores))
    gbest, gbest_score = pos[g].copy(), float(scores[g])
    history: list[float] = []

    stale = 0
    for it in range(config.max_iterations):
        frac = it / max(config.max_iterations - 1, 1)
        w_t = config.inertia_weight + (min(config.inertia_end, config.inertia_weight)
                                       - config.inertia_weight) * frac
        r1 = rng.random((m, n))
        r2 = rng.random((m, n))
        vel = (
            w_t * vel
            + config.cognitive_coeff * r1 * (pbest - pos)
            + config.social_coeff * r2 * (gbest - pos)
        )
        vel = np.clip(vel, -config.max_velocity, config.max_velocity)
        pos = np.array([fix(p) for p in pos + vel])
        scores = np.array([fit(p) for p in pos])

        improved = scores < pbest_score
        pbest[improved] = pos[improved]
        pbest_score[improved] = scores[improved]

        g = int(np.argmin(pbest_score))
        if pbest_score[g] < gbest_score - 1e-12:
            gbest, gbest_score = pbest[g].copy(), float(pbest_score[g])
            stale = 0
        else:
            stale += 1
        if stale >= config.stagnation_limit and it < config.max_iterations - 1:
            # reinicia la mitad peor del enjambre para escapar del estancamiento
            worst = np.argsort(pbest_score)[m // 2:]
            for k in worst:
                pos[k] = fix(rng.dirichlet(np.ones(n)))
                vel[k] = rng.uniform(-0.05, 0.05, n)
                pbest[k], pbest_score[k] = pos[k].copy(), fit(pos[k])
            stale = 0

        history.append(gbest_score if objective == "min_variance" else -gbest_score)

    logger.info("PSO terminó: fitness=%.6f", gbest_score)
    return build_result(tickers, gbest, mu, sigma, history, risk_free)
