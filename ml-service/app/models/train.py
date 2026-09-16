"""
Job de reentrenamiento mensual del modelo LSTM — Render Cron Job.

Estrategia (ver §4.2 del plan):
  - Corre el día 1 de cada mes (schedule: "0 0 1 * *")
  - Usa una ventana móvil de LSTM_TRAINING_WINDOW_MONTHS meses de price_history
  - Guarda el nuevo modelo en la tabla lstm_model con version incremental
  - El servicio web usa automáticamente el modelo con trained_at más reciente

Se ejecuta vía Render Cron Job:
  startCommand: python -m app.models.train
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import date, datetime, timezone
from dateutil.relativedelta import relativedelta  # type: ignore[import]

from sqlalchemy import select

from app.core.config import settings
from app.db.models import Asset, LstmModel, PriceHistory
from app.db.session import AsyncSessionLocal

logging.basicConfig(level="INFO", format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


async def retrain() -> None:
    """Punto de entrada del cron job mensual de reentrenamiento."""
    logger.info("Starting monthly LSTM retraining...")

    window_start = date.today() - relativedelta(months=settings.LSTM_TRAINING_WINDOW_MONTHS)
    window_end = date.today()

    async with AsyncSessionLocal() as db:
        # Obtener todos los activos con datos suficientes
        result = await db.execute(select(Asset))
        assets = result.scalars().all()

        logger.info(
            "Training window: %s → %s | Assets: %d",
            window_start,
            window_end,
            len(assets),
        )

        # TODO: implementar el entrenamiento real del LSTM aquí.
        # El flujo esperado:
        #   1. Cargar price_history de todos los activos en la ventana
        #   2. Preprocesar (normalización, creación de secuencias)
        #   3. Entrenar el modelo LSTM (TensorFlow o PyTorch)
        #   4. Evaluar métricas (MSE, MAE, R²) en el conjunto de validación
        #   5. Guardar los pesos del modelo (archivo .keras / .pt)
        #   6. Insertar una nueva fila en lstm_model (ver abajo)

        # Por ahora: registra un placeholder para validar el flujo de la BD
        version = f"v0.{window_end.strftime('%Y%m')}"
        new_model = LstmModel(
            id=uuid.uuid4(),
            version=version,
            hyperparameters={
                "sequence_length": 60,
                "hidden_units": 64,
                "num_layers": 2,
                "dropout": 0.2,
                "horizon_days": 21,
            },
            metrics={"status": "placeholder — entrenamiento real pendiente"},
            training_window_start=window_start,
            training_window_end=window_end,
            trained_at=datetime.now(timezone.utc),
        )
        db.add(new_model)
        await db.commit()

    logger.info("Retraining job finished. Model version: %s", version)


if __name__ == "__main__":
    asyncio.run(retrain())
