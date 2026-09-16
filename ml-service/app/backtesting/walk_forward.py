"""
Walk-Forward Analysis (Backtesting) — Sección 4.6.4 del TT.
Esqueleto con interfaz definida — implementación pendiente.

Metodología:
  Divide el historial en ventanas consecutivas:
    [train_start ... train_end] → optimiza
    [test_start  ... test_end ] → evalúa con los pesos encontrados
  Desliza la ventana y repite.

Métricas calculadas por ventana:
  - Sharpe ratio (retorno ajustado por riesgo)
  - Sortino ratio (considera solo la volatilidad negativa)
  - Maximum drawdown (caída máxima desde el pico)
  - Cumulative return (retorno acumulado total)
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import date

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class WalkForwardConfig:
    train_months: int = 12    # tamaño de la ventana de entrenamiento (meses)
    test_months: int = 3      # tamaño de la ventana de prueba (meses)
    step_months: int = 3      # desplazamiento entre ventanas


@dataclass
class BacktestMetrics:
    sharpe: float
    sortino: float
    max_drawdown: float
    cumulative_return: float
    equity_curve: pd.Series = field(default_factory=pd.Series)  # fecha → valor


def run_walk_forward(
    weights: dict[str, float],       # pesos del portafolio optimizado
    price_history: pd.DataFrame,     # columnas: date, ticker, adj_close
    benchmark: str = "equal_weight", # "equal_weight" | "sp500" | ticker
    start_date: date | None = None,
    end_date: date | None = None,
    config: WalkForwardConfig | None = None,
) -> BacktestMetrics:
    """
    Evalúa el portafolio usando Walk-Forward Analysis.

    Args:
        weights:       Pesos del portafolio (suman 1).
        price_history: Historial de precios en formato largo.
        benchmark:     Portafolio de referencia para comparación.
        start_date:    Inicio del período de evaluación.
        end_date:      Fin del período de evaluación.
        config:        Parámetros del Walk-Forward.

    Returns:
        BacktestMetrics con Sharpe, Sortino, MaxDD, retorno acumulado y curva de equity.
    """
    config = config or WalkForwardConfig()

    raise NotImplementedError(
        "TODO: implementar Walk-Forward Analysis (ver Sección 4.6.4 del TT). "
        "Paso 1: pivotear price_history a wide format (fecha × ticker). "
        "Paso 2: calcular retornos diarios. "
        "Paso 3: aplicar pesos y calcular retorno del portafolio día a día. "
        "Paso 4: calcular métricas sobre la curva de equity resultante."
    )
