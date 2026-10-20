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
    compute_metrics,
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


COST_GRID = (0, 10, 25, 50, 100, 200)


def daily_returns(m) -> pd.Series:
    """Retornos diarios OOS (sin costos) a partir de la curva de equity."""
    return m.equity_curve.pct_change().dropna()


def net_returns(m, bps: float) -> pd.Series:
    """Descuenta bps × rotación en el primer día de cada ventana (mismo criterio que el backtest)."""
    r = daily_returns(m).copy()
    for w in m.windows:
        d = pd.Timestamp(w["test_start"])
        if d in r.index:
            r.loc[d] -= w["turnover"] * bps / 1e4
    return r


def sharpe_of(r: np.ndarray) -> float:
    sd = r.std(ddof=1)
    return float(r.mean() / sd * np.sqrt(252)) if sd > 1e-12 else 0.0


def paired_bootstrap(a: pd.Series, b: pd.Series, n_boot: int = 2000, block: int = 21, seed: int = 7):
    """
    Prueba de la diferencia de Sharpe (a − b) con bootstrap pareado por bloques circulares
    (conserva la autocorrelación y la dependencia entre ambas series). Devuelve
    (Δ observada, IC95 inferior, IC95 superior, p bilateral, H0: Δ = 0).
    """
    idx = a.index.intersection(b.index)
    x, y = a.loc[idx].to_numpy(), b.loc[idx].to_numpy()
    T = len(x)
    rng = np.random.default_rng(seed)
    n_blocks = int(np.ceil(T / block))
    starts = rng.integers(0, T, size=(n_boot, n_blocks))
    pos = ((starts[:, :, None] + np.arange(block)[None, None, :]) % T).reshape(n_boot, -1)[:, :T]
    xs, ys = x[pos], y[pos]

    def sharpes(z):
        sd = z.std(axis=1, ddof=1)
        return np.where(sd > 1e-12, z.mean(axis=1) / np.where(sd > 1e-12, sd, 1) * np.sqrt(252), 0.0)

    d_obs = sharpe_of(x) - sharpe_of(y)
    d_boot = sharpes(xs) - sharpes(ys)
    lo, hi = np.percentile(d_boot, [2.5, 97.5])
    p = float(np.mean(np.abs(d_boot - d_boot.mean()) >= abs(d_obs)))   # H0: Δ = 0 (distribución centrada)
    return d_obs, float(lo), float(hi), max(p, 1.0 / n_boot)


def break_even_bps(opt: pd.Series, ew: pd.Series, m_opt, m_ew, grid=COST_GRID):
    """Primer costo (pb) en que el Sharpe neto del optimizador deja de superar a 1/N (interpolado)."""
    diffs = [sharpe_of(net_returns(m_opt, c).to_numpy()) - sharpe_of(net_returns(m_ew, c).to_numpy()) for c in grid]
    if diffs[0] <= 0:
        return 0.0, diffs
    for (c0, d0), (c1, d1) in zip(zip(grid, diffs), zip(grid[1:], diffs[1:])):
        if d1 <= 0:
            return c0 + (c1 - c0) * d0 / (d0 - d1), diffs
    return float("inf"), diffs


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

    sig_rows, be_rows = [], []
    for uni in a.universes:
        prices = load_prices(UNIVERSES[uni], a.years, a.offline)
        n = prices.shape[1]
        report.append(f"\n## Universo `{uni}` ({n} activos, {len(prices)} días: "
                      f"{prices.index[0].date()} → {prices.index[-1].date()})\n")
        print(f"\n== {uni}: {n} activos ==")
        ew = run_walk_forward(prices, equal_weight_strategy, cost_bps=0)
        ew_net = net_returns(ew, a.cost_bps)
        spy_m = series_returns_over(ew, spy, a.cost_bps)

        def met(m, bps=a.cost_bps):
            out = compute_metrics(net_returns(m, bps))
            out.avg_turnover = m.avg_turnover
            return out

        for cap in a.caps:
            if n * cap < 1.0:
                report.append(f"\n_Tope {cap:.0%} infactible con {n} activos; omitido._\n")
                continue
            mk = run_walk_forward(prices, make_markowitz_strategy(np.zeros(n), np.full(n, cap)), cost_bps=0)
            rows = [row("1/N", met(ew)), row(f"Markowitz (tope {cap:.0%})", met(mk)), row("SPY", spy_m)]
            for algo in ALGOS:
                t0 = time.time()
                m = run_walk_forward(prices, optimizer_strategy(algo, cap), cost_bps=0)
                mm = met(m)
                rows.append(row(f"{algo.upper()} (tope {cap:.0%})", mm))
                net = net_returns(m, a.cost_bps)
                d, lo, hi, p = paired_bootstrap(net, ew_net)
                be, _ = break_even_bps(net, ew_net, m, ew)
                sig_rows.append(dict(universo=uni, tope=cap, algo=algo.upper(), d=d, lo=lo, hi=hi, p=p))
                if algo == "ga":
                    be_rows.append(dict(universo=uni, tope=cap, be=be,
                                        grid=[sharpe_of(net_returns(m, c).to_numpy()) for c in COST_GRID],
                                        grid_ew=[sharpe_of(net_returns(ew, c).to_numpy()) for c in COST_GRID],
                                        turnover=m.avg_turnover))
                summary.append(dict(universo=uni, tope=cap, algo=algo.upper(), sharpe=mm.sharpe,
                                    sharpe_1n=met(ew).sharpe, sharpe_mk=met(mk).sharpe, ret=mm.cumulative_return,
                                    ret_1n=met(ew).cumulative_return))
                print(f"  tope {cap:.0%} {algo}: Sharpe {mm.sharpe:.2f} (1/N {met(ew).sharpe:.2f}) "
                      f"Δ={d:+.2f} p={p:.2f} [{time.time() - t0:.1f}s]")
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
    if sig_rows:
        sg = pd.DataFrame(sig_rows)
        report.append("\n## Significancia: Sharpe del optimizador − Sharpe de 1/N\n")
        report.append("Bootstrap pareado por bloques circulares (21 días, 2000 remuestreos), con costos. "
                      "H0: la diferencia es 0. IC95 que incluye 0 ⇒ no concluyente.\n")
        report.append("| Universo | Tope | Algoritmo | ΔSharpe | IC95 | p | ¿Significativo (p<0.05)? |\n|---|---|---|---|---|---|---|")
        for r in sg.itertuples():
            report.append(f"| {r.universo} | {r.tope:.0%} | {r.algo} | {r.d:+.2f} | [{r.lo:+.2f}, {r.hi:+.2f}] | "
                          f"{r.p:.2f} | {'sí' if r.p < 0.05 else 'no'} |")
        report.append(f"\nSignificativas al 5 %: **{int((sg.p < 0.05).sum())} de {len(sg)}** "
                      f"(GA/PSO/DE son casi la misma cartera, por lo que no son pruebas independientes).")
    if be_rows:
        report.append("\n## Sensibilidad a costos (GA vs 1/N)\n")
        report.append("Sharpe neto según el costo de transacción (pb por unidad rotada). "
                      "«Punto de equilibrio» = costo a partir del cual el optimizador deja de superar a 1/N.\n")
        hdr = " | ".join(f"{c} pb" for c in COST_GRID)
        report.append(f"| Universo | Tope | Rotación | Serie | {hdr} | Punto de equilibrio |\n|---|---|---|---|" + "---|" * (len(COST_GRID) + 1))
        for r in be_rows:
            be = "> 200 pb" if r["be"] == float("inf") else ("sin ventaja" if r["be"] == 0 else f"≈ {r['be']:.0f} pb")
            report.append(f"| {r['universo']} | {r['tope']:.0%} | {r['turnover']:.2f} | GA | "
                          + " | ".join(f"{x:.2f}" for x in r["grid"]) + f" | {be} |")
            report.append(f"| | | | 1/N | " + " | ".join(f"{x:.2f}" for x in r["grid_ew"]) + " | |")
    (ROOT / "universe_study.md").write_text("\n".join(report), encoding="utf-8")
    print(f"\nListo → {ROOT / 'universe_study.md'}")


if __name__ == "__main__":
    main()
