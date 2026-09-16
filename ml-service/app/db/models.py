"""
Modelos SQLAlchemy que REFLEJAN el esquema definido en Drizzle (web/src/server/db/).
Regla: estas tablas las crea Drizzle; Python solo las LEE/ESCRIBE con este mapeador.
Cuando cambies el esquema en Drizzle, actualiza también este archivo.

Tablas de las que Python es DUEÑO (escritura):
  asset, price_history, optimization_run, optimization_result,
  lstm_model, lstm_prediction, backtest, backtest_equity_point

Tablas que Python solo LEE:
  user, session (de Better Auth), portfolio, portfolio_candidate, chat_message
"""
import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# Tablas de Better Auth (solo lectura desde Python)
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "user"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    portfolios: Mapped[list["Portfolio"]] = relationship(back_populates="user")


# ---------------------------------------------------------------------------
# Market Data — dueño: ml-service
# ---------------------------------------------------------------------------

class Asset(Base):
    __tablename__ = "asset"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker: Mapped[str] = mapped_column(String(20), unique=True)
    name: Mapped[str | None] = mapped_column(String)
    asset_type: Mapped[str | None] = mapped_column(String(50))   # equity, etf, crypto…
    exchange: Mapped[str | None] = mapped_column(String(50))
    currency: Mapped[str | None] = mapped_column(String(10))

    prices: Mapped[list["PriceHistory"]] = relationship(back_populates="asset")
    predictions: Mapped[list["LstmPrediction"]] = relationship(back_populates="asset")


class PriceHistory(Base):
    __tablename__ = "price_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset.id"))
    date: Mapped[date] = mapped_column(Date)
    open: Mapped[Decimal | None] = mapped_column(Numeric(18, 6))
    high: Mapped[Decimal | None] = mapped_column(Numeric(18, 6))
    low: Mapped[Decimal | None] = mapped_column(Numeric(18, 6))
    close: Mapped[Decimal] = mapped_column(Numeric(18, 6))
    adj_close: Mapped[Decimal | None] = mapped_column(Numeric(18, 6))
    volume: Mapped[int | None] = mapped_column(BigInteger)
    source: Mapped[str] = mapped_column(String(30))  # "yfinance" | "alpha_vantage"
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    asset: Mapped["Asset"] = relationship(back_populates="prices")


# ---------------------------------------------------------------------------
# Portfolio (dueño: Next.js — solo lectura aquí)
# ---------------------------------------------------------------------------

class Portfolio(Base):
    __tablename__ = "portfolio"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"))
    name: Mapped[str] = mapped_column(String)
    capital: Mapped[Decimal | None] = mapped_column(Numeric(18, 2))
    risk_aversion_lambda: Mapped[Decimal | None] = mapped_column(Numeric(8, 4))
    max_assets: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="portfolios")
    candidates: Mapped[list["PortfolioCandidate"]] = relationship(back_populates="portfolio")
    runs: Mapped[list["OptimizationRun"]] = relationship(back_populates="portfolio")


class PortfolioCandidate(Base):
    __tablename__ = "portfolio_candidate"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolio.id"))
    asset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset.id"))
    min_weight: Mapped[Decimal | None] = mapped_column(Numeric(6, 4))
    max_weight: Mapped[Decimal | None] = mapped_column(Numeric(6, 4))

    portfolio: Mapped["Portfolio"] = relationship(back_populates="candidates")


# ---------------------------------------------------------------------------
# Optimization — dueño: ml-service
# ---------------------------------------------------------------------------

class OptimizationRun(Base):
    __tablename__ = "optimization_run"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("portfolio.id"))
    algorithm: Mapped[str] = mapped_column(String(10))  # "ga" | "pso" | "de"
    status: Mapped[str] = mapped_column(String(20))      # "pending" | "running" | "done" | "error"
    params: Mapped[dict | None] = mapped_column(JSONB)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    portfolio: Mapped["Portfolio"] = relationship(back_populates="runs")
    results: Mapped[list["OptimizationResult"]] = relationship(back_populates="run")
    backtests: Mapped[list["Backtest"]] = relationship(back_populates="run")


class OptimizationResult(Base):
    __tablename__ = "optimization_result"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    optimization_run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("optimization_run.id"))
    asset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset.id"))
    weight: Mapped[Decimal] = mapped_column(Numeric(8, 6))

    run: Mapped["OptimizationRun"] = relationship(back_populates="results")


# ---------------------------------------------------------------------------
# LSTM — dueño: ml-service
# ---------------------------------------------------------------------------

class LstmModel(Base):
    __tablename__ = "lstm_model"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    version: Mapped[str] = mapped_column(String(50))  # "v1.0", "v1.1", …
    hyperparameters: Mapped[dict | None] = mapped_column(JSONB)
    metrics: Mapped[dict | None] = mapped_column(JSONB)  # MSE, MAE, etc.
    training_window_start: Mapped[date | None] = mapped_column(Date)
    training_window_end: Mapped[date | None] = mapped_column(Date)
    trained_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    predictions: Mapped[list["LstmPrediction"]] = relationship(back_populates="model")


class LstmPrediction(Base):
    __tablename__ = "lstm_prediction"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("asset.id"))
    lstm_model_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("lstm_model.id"))
    prediction_date: Mapped[date] = mapped_column(Date)
    horizon_days: Mapped[int] = mapped_column(Integer)
    predicted_return: Mapped[Decimal | None] = mapped_column(Numeric(10, 6))
    predicted_risk: Mapped[Decimal | None] = mapped_column(Numeric(10, 6))
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    asset: Mapped["Asset"] = relationship(back_populates="predictions")
    model: Mapped["LstmModel"] = relationship(back_populates="predictions")


# ---------------------------------------------------------------------------
# Backtesting — dueño: ml-service
# ---------------------------------------------------------------------------

class Backtest(Base):
    __tablename__ = "backtest"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    optimization_run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("optimization_run.id"))
    benchmark_type: Mapped[str] = mapped_column(String(30))  # "sp500" | "equal_weight" | …
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    sharpe: Mapped[Decimal | None] = mapped_column(Numeric(10, 6))
    sortino: Mapped[Decimal | None] = mapped_column(Numeric(10, 6))
    max_drawdown: Mapped[Decimal | None] = mapped_column(Numeric(10, 6))
    cumulative_return: Mapped[Decimal | None] = mapped_column(Numeric(10, 6))
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    run: Mapped["OptimizationRun"] = relationship(back_populates="backtests")
    equity_points: Mapped[list["BacktestEquityPoint"]] = relationship(back_populates="backtest")


class BacktestEquityPoint(Base):
    __tablename__ = "backtest_equity_point"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    backtest_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("backtest.id"))
    date: Mapped[date] = mapped_column(Date)
    portfolio_value: Mapped[Decimal] = mapped_column(Numeric(18, 4))

    backtest: Mapped["Backtest"] = relationship(back_populates="equity_points")
