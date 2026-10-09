"""
Experimento: ¿aporta el LSTM al desempeño fuera de muestra?  (sin look-ahead)

En cada ventana del walk-forward 12/3/3 se reentrena el LSTM usando ÚNICAMENTE los
precios de entrenamiento de esa ventana, y se optimiza la cartera con tres fuentes de μ:
    historical : media log anualizada de la ventana
    lstm       : predicción del LSTM, calibrada a la dispersión histórica
    blend      : 0.5·lstm + 0.5·historical
Se reportan Sharpe/Sortino/MDD/retorno OOS y rotación de cada variante junto con 1/N.

Uso (requiere torch; ver requirements-train.txt):
    python -m scripts.lstm_walk_forward_experiment --synthetic trending --assets 8
    python -m scripts.lstm_walk_forward_experiment --universe acciones_grandes   # Yahoo, sin BD
    python -m scripts.lstm_walk_forward_experiment --tickers AAPL MSFT ...        # lee price_history
"""
from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.backtesting.walk_forward import equal_weight_strategy, run_walk_forward  # noqa: E402
from app.optimization.portfolio_math import historical_mean_return, ledoit_wolf_cov  # noqa: E402
from app.optimization.runner import run_algorithm  # noqa: E402

logger = logging.getLogger(__name__)
SOURCES = ("historical", "lstm", "blend")


def synthetic_prices(kind: str, n: int = 8, T: int = 1000, seed: int = 0) -> pd.DataFrame:
    """'random' (sin señal) o 'trending' (deriva latente persistente → hay señal)."""
    rng = np.random.default_rng(seed)
    r, d = np.zeros((T, n)), np.zeros(n)
    for t in range(T):
        if kind == "trending":
            d = 0.985 * d + rng.normal(0, 0.0012, n)
            r[t] = d + rng.normal(0, 0.010, n)
        else:
            r[t] = rng.normal(0.0003, 0.012, n)
    idx = pd.bdate_range("2021-01-01", periods=T)
    return pd.DataFrame(100 * np.exp(np.cumsum(r, 0)), index=idx, columns=[f"A{i}" for i in range(n)])


def evaluate(
    prices: pd.DataFrame,
    algorithm: str = "de",
    lstm_epochs: int = 8,
    opt_params: dict | None = None,
    cost_bps: float = 0.0,
) -> pd.DataFrame:
    """Devuelve una fila de métricas OOS por variante (1/N + cada fuente de μ)."""
    from app.models.lstm_model import LstmConfig, train_model
    from app.services.lstm_service import lstm_expected_returns

    opt_params = {"population_size": 30, "max_generations": 60, "generations": 60,
                  "max_iterations": 60, "num_particles": 30, **(opt_params or {})}
    cols = list(prices.columns)
    cache: dict = {}                       # (inicio, fin) de entrenamiento → μ_lstm calibrado

    def mu_for(train: pd.DataFrame, source: str) -> np.ndarray:
        X = train.to_numpy(float)
        mu_h = historical_mean_return(X)
        if source == "historical":
            return mu_h
        key = (train.index[0], train.index[-1])
        if key not in cache:
            predictor, _ = train_model(train, LstmConfig(epochs=lstm_epochs, hidden_units=16))
            cache[key] = lstm_expected_returns(predictor, train, mu_h)
        mu_l = cache[key]
        return mu_l if source == "lstm" else 0.5 * mu_l + 0.5 * mu_h

    def make_strategy(source: str):
        def strategy(train: pd.DataFrame) -> np.ndarray:
            res = run_algorithm(algorithm, list(train.columns), mu_for(train, source),
                                ledoit_wolf_cov(train.to_numpy(float)), 1.0, None, None, None,
                                opt_params, "sharpe")
            return np.array([res.weights[t] for t in train.columns])
        return strategy

    rows = []
    runs = {"equal_weight": equal_weight_strategy,
            **{f"{algorithm}+{s}": make_strategy(s) for s in SOURCES}}
    for name, strat in runs.items():
        m = run_walk_forward(prices[cols], strat, cost_bps=cost_bps)
        rows.append(dict(strategy=name, sharpe=m.sharpe, sortino=m.sortino,
                         max_drawdown=m.max_drawdown, cumulative_return=m.cumulative_return,
                         avg_turnover=m.avg_turnover, windows=len(m.windows)))
        logger.info("%s: Sharpe %.2f", name, m.sharpe)
    return pd.DataFrame(rows)


async def _load_prices(tickers: list[str]) -> pd.DataFrame:
    from sqlalchemy import select

    from app.db.models import Asset
    from app.db.session import AsyncSessionLocal
    from app.services.market_data import load_price_matrix, prepare_universe

    async with AsyncSessionLocal() as db:
        assets = (await db.execute(select(Asset).where(Asset.ticker.in_(tickers)))).scalars().all()
        wide = await load_price_matrix(db, [a.id for a in assets], align=False)
    prices, _ = prepare_universe(wide, [a.ticker for a in assets])
    return prices.dropna()


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--synthetic", choices=["random", "trending"])
    src.add_argument("--tickers", nargs="+", help="lee price_history de la BD (DATABASE_URL)")
    src.add_argument("--universe", help="descarga de Yahoo (sin BD): acciones_grandes | etf_sectores | defensivo")
    ap.add_argument("--assets", type=int, default=8)
    ap.add_argument("--algorithm", default="de", choices=["ga", "pso", "de"])
    ap.add_argument("--epochs", type=int, default=8)
    ap.add_argument("--cost-bps", type=float, default=10.0)
    ap.add_argument("--years", type=int, default=6, help="historial a descargar con --universe")
    a = ap.parse_args()
    logging.basicConfig(level="INFO", format="%(message)s")

    if a.synthetic:
        prices = synthetic_prices(a.synthetic, a.assets)
    elif a.universe:
        from scripts.universe_study import UNIVERSES, load_prices
        prices = load_prices(UNIVERSES[a.universe], a.years, offline=False)
    else:
        import asyncio
        prices = asyncio.run(_load_prices(a.tickers))
    out = evaluate(prices, a.algorithm, a.epochs, cost_bps=a.cost_bps)
    print(out.round(3).to_string(index=False))


if __name__ == "__main__":
    main()
