"""
Configuración del servicio vía variables de entorno.
Usa pydantic-settings para validar y tipar todas las variables.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # ---- Identidad del servicio ----
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # ---- Base de datos (Supabase Postgres) ----
    DATABASE_URL: str  # requerido — no tiene default

    # ---- Seguridad interna ----
    ML_SERVICE_API_KEY: str  # requerido — no tiene default
    # URL del frontend Next.js (para CORS)
    NEXT_APP_URL: str = "http://localhost:3000"

    # ---- APIs de mercado ----
    ALPHA_VANTAGE_API_KEY: str = ""

    # ---- LSTM ----
    LSTM_TRAINING_WINDOW_MONTHS: int = 24


settings = Settings()  # type: ignore[call-arg]
