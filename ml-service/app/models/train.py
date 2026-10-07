"""
Job de reentrenamiento mensual del modelo LSTM.

Estrategia:
  - Corre el día 1 de cada mes (GitHub Actions programado o Render Cron Job)
  - Usa una ventana móvil de LSTM_TRAINING_WINDOW_MONTHS meses de price_history
  - Entrena FUERA del servicio web (requiere torch) y guarda los pesos en la BD
    (lstm_model.weights_base64); el servicio web solo hace inferencia con NumPy
  - El servicio usa automáticamente el modelo con trained_at más reciente

Ejecución:
  python -m app.models.train
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import date, datetime, timezone

from dateutil.relativedelta import relativedelta  # type: ignore[import]
from sqlalchemy import select

from app.core.config import settings
from app.db.models import Asset, LstmModel
from app.db.session import AsyncSessionLocal
from app.models.lstm_model import LstmConfig, train_model
from app.services.market_data import load_price_matrix

logging.basicConfig(level="INFO", format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

MIN_ROWS_PER_ASSET = 150  # activos con menos historial se excluyen del entrenamiento


async def retrain(config: LstmConfig | None = None) -> str:
    """Entrena con los datos de la BD, guarda el modelo y devuelve su versión."""
    window_end = date.today()
    window_start = window_end - relativedelta(months=settings.LSTM_TRAINING_WINDOW_MONTHS)
    logger.info("Starting LSTM retraining: %s → %s", window_start, window_end)

    async with AsyncSessionLocal() as db:
        assets = (await db.execute(select(Asset))).scalars().all()
        prices = await load_price_matrix(
            db, [a.id for a in assets], start=window_start, end=window_end, align=False
        )
        prices = prices.loc[:, prices.count() >= MIN_ROWS_PER_ASSET]
        if prices.shape[1] == 0:
            raise RuntimeError("Ningún activo tiene historial suficiente para entrenar.")
        logger.info("Assets in training: %d", prices.shape[1])

        predictor, metrics = await asyncio.to_thread(train_model, prices, config)
        metrics["assets"] = list(prices.columns)
        logger.info("Validation metrics: %s", {k: v for k, v in metrics.items() if k != "assets"})

        version = f"v1.{datetime.now(timezone.utc):%Y%m%d%H%M}"
        db.add(
            LstmModel(
                id=uuid.uuid4(),
                version=version,
                hyperparameters=predictor.hyperparameters(),
                metrics=metrics,
                training_window_start=window_start,
                training_window_end=window_end,
                weights_base64=predictor.to_base64(),
                trained_at=datetime.now(timezone.utc),
            )
        )
        await db.commit()

    logger.info("Retraining finished. Model version: %s", version)
    return version


if __name__ == "__main__":
    asyncio.run(retrain())
