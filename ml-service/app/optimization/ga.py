"""
Algoritmo Genético para optimización de carteras (RF-04, RF-05).
Esqueleto con interfaz definida — implementación pendiente.

Referencias del TT:
  - Sección 4.6.2: Descripción del Algoritmo Genético
  - Función objetivo: Sharpe ratio (o función de Markowitz con λ)
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class GAConfig:
    population_size: int = 100
    generations: int = 200
    mutation_rate: float = 0.05
    crossover_rate: float = 0.8
    elitism: int = 5              # individuos élite que pasan sin mutación
    seed: int | None = None


@dataclass
class OptimizationResult:
    weights: dict[str, float]     # {"AAPL": 0.35, "MSFT": 0.25, ...}
    expected_return: float
    expected_risk: float
    sharpe_ratio: float
    convergence_history: list[float] = field(default_factory=list)


def optimize(
    tickers: list[str],
    expected_returns: np.ndarray,  # μ para cada ticker (del LSTM o histórico)
    cov_matrix: np.ndarray,        # Σ (covarianza de retornos)
    risk_aversion: float = 1.0,    # λ del perfil del usuario
    min_weights: np.ndarray | None = None,
    max_weights: np.ndarray | None = None,
    config: GAConfig | None = None,
) -> OptimizationResult:
    """
    Ejecuta el Algoritmo Genético para encontrar los pesos óptimos del portafolio.

    Args:
        tickers:          Lista de símbolos en el mismo orden que expected_returns / cov_matrix.
        expected_returns: Vector μ de retornos esperados (N,).
        cov_matrix:       Matriz de covarianza (N, N).
        risk_aversion:    λ — mayor valor = más averso al riesgo.
        min_weights:      Peso mínimo por activo (N,). Default: 0.
        max_weights:      Peso máximo por activo (N,). Default: 1.
        config:           Hiperparámetros del GA.

    Returns:
        OptimizationResult con los pesos óptimos y métricas de la solución.
    """
    config = config or GAConfig()
    n = len(tickers)

    if min_weights is None:
        min_weights = np.zeros(n)
    if max_weights is None:
        max_weights = np.ones(n)

    raise NotImplementedError(
        "TODO: implementar GA (ver Sección 4.6.2 del TT). "
        "Sugerencia: usar DEAP o implementar selección por torneo + crossover de un punto."
    )
