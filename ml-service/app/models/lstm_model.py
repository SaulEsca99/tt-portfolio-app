"""
Esqueleto del modelo LSTM para predicción de retorno/riesgo por activo.
Implementación pendiente (RF-03).

NOTA: Este archivo define la interfaz y la arquitectura esperada.
      El entrenamiento real se hace en train.py.
      La inferencia (forward pass) se usa en el router de optimización.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date
from typing import TYPE_CHECKING

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuración de la arquitectura (ajustar según experimentos del TT)
# ---------------------------------------------------------------------------

@dataclass
class LstmConfig:
    sequence_length: int = 60      # días de ventana de contexto
    hidden_units: int = 64
    num_layers: int = 2
    dropout: float = 0.2
    horizon_days: int = 21         # horizonte de predicción (1 mes de trading)
    learning_rate: float = 0.001


# ---------------------------------------------------------------------------
# Interfaz pública
# ---------------------------------------------------------------------------

class LstmPredictor:
    """
    Encapsula el modelo LSTM entrenado y expone predict().
    Se carga desde un archivo de pesos guardado por train.py.

    Uso:
        predictor = LstmPredictor.load("models/saved/lstm_v1.pkl")
        result = predictor.predict(prices_df)
    """

    def __init__(self, config: LstmConfig):
        self.config = config
        self._model = None   # se asigna en load() o después de entrenar

    @classmethod
    def load(cls, path: str) -> "LstmPredictor":
        """Carga un modelo previamente guardado."""
        raise NotImplementedError(
            "TODO: implementar carga de pesos (TensorFlow .keras o PyTorch .pt)"
        )

    def predict(self, prices: pd.DataFrame) -> dict[str, float]:
        """
        Predice el retorno esperado y la volatilidad para los próximos
        `horizon_days` días de trading.

        Args:
            prices: DataFrame con columna 'adj_close' ordenado por fecha.

        Returns:
            {"predicted_return": float, "predicted_risk": float}
        """
        raise NotImplementedError(
            "TODO: implementar inferencia LSTM (Sección 5.4 del TT)"
        )

    def _preprocess(self, prices: pd.DataFrame) -> np.ndarray:
        """Normaliza y arma las secuencias de entrada."""
        raise NotImplementedError
