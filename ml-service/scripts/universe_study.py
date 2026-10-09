"""
Estudio de robustez fuera de muestra: varios universos × topes de peso × algoritmos.

Compara GA/PSO/DE contra 1/N, Markowitz (SLSQP) y SPY con walk-forward 12/3/3 y costos.
No usa la BD ni toca producción: descarga de Yahoo y trabaja en memoria.

    cd ml-service
    python -m scripts.universe_study                       # todos los universos
    python -m scripts.universe_study --universes etf_sectores defensivo --caps 0.2 0.3
    python -m scripts.universe_study --offline             # datos simulados (verifica el script)

Escribe `universe_study.md` (tablas listas para el capítulo de resultados).
"""
from __future__ import annotations

import argparse
import sys
import time
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402

from app.backtesting.walk_forward import (  # noqa: E402
    equal_weight_strategy,
    make_markowitz_strategy,
    run_walk_forward,
    series_returns_over,
)
from app.data import fetch_yfinance  # noqa: E402
from app.optimization.portfolio_math import historical_mean_return, ledoit_wolf_cov  # noqa: E402
from app.optimization.runner import run_algorithm  # noqa: E402

UNIVERSES = {
    "acciones_grandes": ["AAPL", "MSFT", "NVDA", "JPM", "XOM", "JNJ", "PG", "KO", "AMZN", "TSLA"],
    "etf_sectores": ["XLK", "XLF", "XLE", "XLV", "XLY", "XLP", "XLI", "XLU", "XLB"],
    "defensivo": ["JNJ", "PG", "KO", "PEP", "WMT", "MCD", "VZ", "DUK", "SO", "MRK"],
}
ALGOS = ("ga", "pso", "de")


def load_prices(tickers: list[str], years: int, offline: bool) -> pd.DataFrame:
    end = date.today()
    start = end - timedelta(days=365 * years)
    cols = {}
    for t in tickers:
        if offline:
            rng = np.random.default_rng(abs(hash(t)) % 2**32)
            idx = pd.bdate_range(start, end)
            cols[t] = pd.Series(100 * np.exp(np.cumsum(rng.normal(0.0004, 0.012, len(idx)))), index=idx)
            continue
        df = fetch_yfinance.fetch_prices(t, start, end)
        if df.empty:
            print(f"  ! sin datos para {t}; se omite")
            continue
        cols[t] = pd.Series(df["adj_close"].to_numpy(float), index=pd.to_datetime(df["date"]))
    wide = pd.DataFrame(cols).sort_index()
    wide = wide.loc[:, wide.count() >= 0.8 * len(wide)]       # activos con historia suficiente
    return wide.dropna(how="any")


def optimizer_strategy(algo: str, cap: float, risk_aversion: float = 1.0):
    def strategy(train: pd.DataFrame) -> np.ndarray:
        n = train.shape[1]
        X = train.to_numpy(float)
        params = {"population_size": 40, "generations": max(60, 2 * n), "num_particles": 40,
                  "max_iterations": max(60, 2 * n), "max_generations": max(60, 2 * n)}
        res = run_algorithm(algo, list(train.columns), historical_mean_return(X), ledoit_wolf_cov(X),
                            risk_aversion, np.zeros(n), np.full(n, cap), None, params, "sharpe")
        return np.array([res.weights[t] for t in train.columns])
    return strategy


def row(name, m):
    return dict(estrategia=name, sharpe=m.sharpe, sortino=m.sortino, mdd=m.max_drawdown,
                ret=m.cumulative_return, rotacion=m.avg_turnover)


def md_table(rows: list[dict]) -> str:
    out = ["| Estrategia | Sharpe | Sortino | MDD | Ret. acum. | Rotación |", "|---|---|---|---|---|---|"]
    for r in rows:
        out.append(f"| {r['estrategia']} | {r['sharpe']:.2f} | {r['sortino']:.2f} | {r['mdd']:.1%} | "
                   f"{r['ret']:.1%} | {r['rotacion']:.2f} |")
    return "\n".join(out)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--universes", nargs="+", default=list(UNIVERSES), choices=list(UNIVERSES))
    ap.add_argument("--caps", nargs="+", type=float, default=[0.2, 0.3, 0.4])
    ap.add_argument("--cost-bps", type=float, default=10.0)
    ap.add_argument("--years", type=int, default=6)
    ap.add_argument("--offline", action="store_true")
    a = ap.parse_args()

    spy = load_prices(["SPY"], a.years, a.offline)["SPY"]
    report = [f"# Estudio de robustez OOS — {date.today()}\n",
              f"Walk-forward 12/3/3 · costo {a.cost_bps:g} pb · historial ~{a.years} años · "
              f"{'DATOS SIMULADOS' if a.offline else 'Yahoo Finance'}\n"]
    summary = []

    for uni in a.universes:
        prices = load_prices(UNIVERSES[uni], a.years, a.offline)
        n = prices.shape[1]
        report.append(f"\n## Universo `{uni}` ({n} activos, {len(prices)} días: "
                      f"{prices.index[0].date()} → {prices.index[-1].date()})\n")
        print(f"\n== {uni}: {n} activos ==")
        base = {}
        ew = run_walk_forward(prices, equal_weight_strategy, cost_bps=a.cost_bps)
        mk = {c: run_walk_forward(prices, make_markowitz_strategy(np.zeros(n), np.full(n, c)),
                                  cost_bps=a.cost_bps) for c in a.caps if n * c >= 1.0}
        base["1/N"] = ew
        spy_m = series_returns_over(ew, spy, a.cost_bps)

        for cap in a.caps:
            if n * cap < 1.0:
                report.append(f"\n_Tope {cap:.0%} infactible con {n} activos; omitido._\n")
                continue
            rows = [row("1/N", ew), row(f"Markowitz (tope {cap:.0%})", mk[cap]), row("SPY", spy_m)]
            for algo in ALGOS:
                t0 = time.time()
                m = run_walk_forward(prices, optimizer_strategy(algo, cap), cost_bps=a.cost_bps)
                rows.append(row(f"{algo.upper()} (tope {cap:.0%})", m))
                summary.append(dict(universo=uni, tope=cap, algo=algo.upper(), sharpe=m.sharpe,
                                    sharpe_1n=ew.sharpe, sharpe_mk=mk[cap].sharpe, ret=m.cumulative_return,
                                    ret_1n=ew.cumulative_return))
                print(f"  tope {cap:.0%} {algo}: Sharpe {m.sharpe:.2f} (1/N {ew.sharpe:.2f}) [{time.time() - t0:.1f}s]")
            report.append(f"\n### Tope por activo {cap:.0%}\n\n" + md_table(rows) + "\n")

    s = pd.DataFrame(summary)
    if not s.empty:
        s["gana_1n"] = s.sharpe > s.sharpe_1n
        s["gana_mk"] = s.sharpe > s.sharpe_mk
        report.append("\n## Resumen\n")
        report.append(f"- Configuraciones evaluadas: {len(s)} (universo × tope × algoritmo)")
        report.append(f"- El optimizador supera a 1/N en Sharpe en **{s.gana_1n.mean():.0%}** de los casos")
        report.append(f"- Supera a Markowitz (SLSQP) en **{s.gana_mk.mean():.0%}** de los casos")
        report.append(f"- Diferencia media de Sharpe vs 1/N: {(s.sharpe - s.sharpe_1n).mean():+.2f}")
        report.append("\nPor universo y tope (Sharpe medio de GA/PSO/DE vs 1/N):\n")
        g = s.groupby(["universo", "tope"]).agg(opt=("sharpe", "mean"), n1=("sharpe_1n", "first"),
                                                mk=("sharpe_mk", "first")).round(2)
        report.append("| Universo | Tope | Optimizadores | 1/N | Markowitz |\n|---|---|---|---|---|")
        for (u, c), r in g.iterrows():
            report.append(f"| {u} | {c:.0%} | {r.opt:.2f} | {r.n1:.2f} | {r.mk:.2f} |")
        report.append("\n> Nota: estos universos se eligen con información de hoy (sesgo de supervivencia). "
                      "Las comparaciones relativas (optimizador vs 1/N) son más fiables que los retornos absolutos.")
    (ROOT / "universe_study.md").write_text("\n".join(report), encoding="utf-8")
    print(f"\nListo → {ROOT / 'universe_study.md'}")


if __name__ == "__main__":
    main()
