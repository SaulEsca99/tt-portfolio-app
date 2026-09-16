"""
Particle Swarm Optimization para optimización de carteras (RF-04, RF-05).
Esqueleto con interfaz definida — implementación pendiente.

Comparte la misma interfaz que ga.py para poder intercambiarlos sin cambiar
el router de optimización (Strategy Pattern implícito).
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import numpy as np

from app.optimization.ga import OptimizationResult  # reutiliza el mismo tipo de resultado

logger = logging.getLogger(__name__)


@dataclass
class PSOConfig:
    num_particles: int = 100
    max_iterations: int = 200
    inertia_weight: float = 0.7       # w
    cognitive_coeff: float = 1.5      # c1 (pbest)
    social_coeff: float = 1.5         # c2 (gbest)
    seed: int | None = None


def optimize(
    tickers: list[str],
    expected_returns: np.ndarray,
    cov_matrix: np.ndarray,
    risk_aversion: float = 1.0,
    min_weights: np.ndarray | None = None,
    max_weights: np.ndarray | None = None,
    config: PSOConfig | None = None,
) -> OptimizationResult:
    """
    Ejecuta PSO para encontrar los pesos óptimos del portafolio.
    Misma firma que ga.optimize() — intercambiables desde el router.
    """
    config = config or PSOConfig()
    n = len(tickers)

    if min_weights is None:
        min_weights = np.zeros(n)
    if max_weights is None:
        max_weights = np.ones(n)

    raise NotImplementedError(
        "TODO: implementar PSO (ver Sección 4.6.3 del TT). "
        "Sugerencia: usar pymoo o implementación propia con proyección al simplex."
    )
