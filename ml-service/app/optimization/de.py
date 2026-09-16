"""
Differential Evolution para optimización de carteras (RF-04, RF-05).
Esqueleto con interfaz definida — implementación pendiente.

Comparte la misma interfaz que ga.py y pso.py (Strategy Pattern).
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np

from app.optimization.ga import OptimizationResult

logger = logging.getLogger(__name__)


@dataclass
class DEConfig:
    population_size: int = 100
    max_generations: int = 200
    mutation_factor: float = 0.8     # F — escala la diferencia entre individuos
    crossover_prob: float = 0.7      # CR — probabilidad de recombinación
    strategy: str = "rand/1/bin"     # estrategia clásica de DE
    seed: int | None = None


def optimize(
    tickers: list[str],
    expected_returns: np.ndarray,
    cov_matrix: np.ndarray,
    risk_aversion: float = 1.0,
    min_weights: np.ndarray | None = None,
    max_weights: np.ndarray | None = None,
    config: DEConfig | None = None,
) -> OptimizationResult:
    """
    Ejecuta Differential Evolution para encontrar los pesos óptimos.
    Misma firma que ga.optimize() y pso.optimize() — intercambiables desde el router.
    """
    config = config or DEConfig()
    n = len(tickers)

    if min_weights is None:
        min_weights = np.zeros(n)
    if max_weights is None:
        max_weights = np.ones(n)

    raise NotImplementedError(
        "TODO: implementar DE (ver Sección 4.6.4 del TT). "
        "Sugerencia: scipy.optimize.differential_evolution como punto de partida."
    )
