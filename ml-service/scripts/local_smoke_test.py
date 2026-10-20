"""
Prueba de humo LOCAL con datos reales (Yahoo Finance) — no toca Supabase ni producción.

Usa una BD SQLite propia (`smoke_test.db`) y el app de FastAPI en memoria (sin red hacia
Render/Vercel). Se niega a ejecutarse si DATABASE_URL apunta a algo que no sea SQLite.

    cd ml-service
    python -m scripts.local_smoke_test                       # tickers por defecto
    python -m scripts.local_smoke_test --tickers AAPL MSFT NVDA JPM XOM JNJ PG KO --max-assets 5
    python -m scripts.local_smoke_test --offline             # datos simulados (verifica el script)

Genera `smoke_report.md` con tiempos, métricas y verificaciones automáticas.
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
import time
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

DB_FILE = ROOT / "smoke_test.db"
_url = os.environ.get("DATABASE_URL", "")
if _url and not _url.startswith("sqlite"):
    sys.exit("ABORTADO: DATABASE_URL no es SQLite. Esta prueba nunca debe correr contra Supabase/producción.")
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{DB_FILE}"
os.environ.setdefault("ML_SERVICE_API_KEY", "smoke-key")
os.environ.setdefault("ENVIRONMENT", "test")

import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from scipy.optimize import minimize  # noqa: E402
from sqlalchemy import select  # noqa: E402
from sqlalchemy.dialects.postgresql import JSONB  # noqa: E402
from sqlalchemy.ext.compiler import compiles  # noqa: E402

from app.db.models import Asset, Base, Portfolio, PortfolioCandidate, User  # noqa: E402
from app.optimization.portfolio_math import (  # noqa: E402
    historical_mean_return,
    ledoit_wolf_cov,
    sharpe_ratio,
)
from app.services.market_data import load_price_matrix, prepare_universe  # noqa: E402


@compiles(JSONB, "sqlite")
def _jsonb_sqlite(type_, compiler, **kw):
    return "JSON"


DEFAULT_TICKERS = ["AAPL", "MSFT", "NVDA", "JPM", "XOM", "JNJ", "PG", "KO", "AMZN", "TSLA"]
AUTH = {"Authorization": f"Bearer {os.environ['ML_SERVICE_API_KEY']}"}
checks: list[tuple[bool, str]] = []


def check(ok: bool, msg: str) -> None:
    checks.append((bool(ok), msg))
    print(("  ✔ " if ok else "  ✘ ") + msg)


def patch_offline() -> None:
    """Sustituye Yahoo por un mercado simulado para verificar el propio script."""
    from app.data import fetch_alpha_vantage, fetch_yfinance

    def fake_prices(ticker, start, end=None):
        rng = np.random.default_rng(abs(hash(ticker)) % 2**32)
        days = pd.bdate_range(start, end or date.today())
        r = rng.normal(0.0004, 0.012, len(days))
        p = 100 * np.exp(np.cumsum(r))
        return pd.DataFrame({"date": [d.date() for d in days], "open": p, "high": p, "low": p,
                             "close": p, "adj_close": p, "volume": 1e6})

    fetch_yfinance.fetch_prices = fake_prices
    fetch_yfinance.get_asset_info = lambda t: {"ticker": t, "name": t, "asset_type": "equity",
                                               "exchange": "TEST", "currency": "USD"}
    fetch_alpha_vantage.fetch_prices = lambda *a, **k: pd.DataFrame()


async def main(a: argparse.Namespace) -> int:
    if a.offline:
        patch_offline()
    if DB_FILE.exists():
        DB_FILE.unlink()

    from app.db.session import AsyncSessionLocal, engine, get_db
    from app.main import app

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def _get_db():
        async with AsyncSessionLocal() as s:
            try:
                yield s
                await s.commit()
            except Exception:
                await s.rollback()
                raise

    app.dependency_overrides[get_db] = _get_db
    tickers = [t.upper() for t in a.tickers]
    lines: list[str] = [f"# Prueba de humo local — {datetime.now():%Y-%m-%d %H:%M}",
                        f"Modo: {'OFFLINE (simulado)' if a.offline else 'Yahoo Finance real'} · "
                        f"tickers: {', '.join(tickers)} · max_assets={a.max_assets} · cap={a.cap:.0%}\n"]

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://smoke", headers=AUTH,
                           timeout=300) as c:
        print("\n[1] Descarga de precios (/assets/fetch)")
        ok_tickers = []
        for t in tickers + ["SPY"]:
            t0 = time.time()
            r = await c.post("/assets/fetch", json={"ticker": t, "force_full_history": True})
            if r.status_code == 200:
                if t != "SPY" or "SPY" in tickers:
                    ok_tickers.append(t)
                print(f"  {t}: ok ({time.time() - t0:.1f}s)")
            else:
                print(f"  {t}: FALLÓ {r.status_code} {r.text[:120]}")
        ok_tickers = [t for t in dict.fromkeys(ok_tickers) if t in tickers]
        check(len(ok_tickers) >= 3, f"descargados {len(ok_tickers)}/{len(tickers)} tickers (mínimo 3)")
        if len(ok_tickers) < 3:
            print("\nSin datos suficientes (¿sin internet o Yahoo bloqueado?). Prueba --offline.")
            return 2

        async with AsyncSessionLocal() as db:
            db.add(User(id="smoke", email="s@s.s", name="smoke", created_at=datetime.now(timezone.utc)))
            pid = uuid.uuid4()
            db.add(Portfolio(id=pid, user_id="smoke", name="smoke", capital=10000, risk_aversion_lambda=2,
                             max_assets=a.max_assets, created_at=datetime.now(timezone.utc)))
            assets = (await db.execute(select(Asset).where(Asset.ticker.in_(ok_tickers)))).scalars().all()
            for asset in assets:
                db.add(PortfolioCandidate(id=uuid.uuid4(), portfolio_id=pid, asset_id=asset.id,
                                          min_weight=0, max_weight=a.cap))
            await db.commit()
            wide = await load_price_matrix(db, [x.id for x in assets], align=False)
        prices, excluded = prepare_universe(wide, [x.ticker for x in assets])
        lines.append(f"Historial: {len(prices)} días ({prices.index[0].date()} → {prices.index[-1].date()}), "
                     f"{prices.shape[1]} activos; excluidos: {excluded or 'ninguno'}\n")

        # referencia SLSQP sobre los mismos datos (sin cardinalidad)
        P = prices.to_numpy(float)
        mu, sg = historical_mean_return(P), ledoit_wolf_cov(P)
        n = len(mu)
        best = max((minimize(lambda w: -sharpe_ratio(w, mu, sg), np.clip(np.random.default_rng(s).dirichlet(np.ones(n)), 0, a.cap) / 1,
                             method="SLSQP", bounds=[(0, a.cap)] * n,
                             constraints=[{"type": "eq", "fun": lambda w: w.sum() - 1}]) for s in range(8)),
                   key=lambda r: r.fun if r.success else 1e9)
        ref = -best.fun if best.success else float("nan")
        lines.append(f"Sharpe de referencia (SLSQP, sin límite de activos): **{ref:.3f}**\n")

        lines += ["## Optimización\n", "| Algoritmo | Tiempo (s) | Sharpe | Retorno esp. | Riesgo | Activos>1% | Gap vs ref. | Objetivo |",
                  "|---|---|---|---|---|---|---|---|"]
        run_ids = {}
        print("\n[2] Optimización (/optimize)")
        for algo in ("ga", "pso", "de"):
            t0 = time.time()
            r = await c.post("/optimize", json={"portfolio_id": str(pid), "algorithm": algo})
            dt = time.time() - t0
            check(r.status_code == 200, f"{algo}: HTTP {r.status_code} en {dt:.1f}s")
            if r.status_code != 200:
                print("     ", r.text[:300]); continue
            b = r.json()
            w = {x["ticker"]: x["weight"] for x in b["weights"]}
            vals = np.array(list(w.values()))
            run_ids[algo] = b["optimizationRunId"]
            check(abs(vals.sum() - 1) < 1e-6, f"{algo}: pesos suman 1 ({vals.sum():.8f})")
            check(vals.max() <= a.cap + 1e-6 and vals.min() >= -1e-9, f"{algo}: pesos dentro de [0, {a.cap:.0%}]")
            if a.max_assets:
                nz = int((vals > 1e-6).sum())
                check(nz <= a.max_assets, f"{algo}: {nz} activos ≤ max_assets={a.max_assets}")
            check(dt < 30, f"{algo}: tiempo < 30 s")
            gap = (ref - b["sharpeRatio"]) / ref * 100 if ref == ref else float("nan")
            lines.append(f"| {algo.upper()} | {dt:.1f} | {b['sharpeRatio']:.3f} | {b['expectedReturn']:.2%} | "
                         f"{b['expectedRisk']:.2%} | {int((vals > 0.01).sum())} | {gap:+.1f}% | {b['objective']} |")
            if b.get("objectiveFallback"):
                lines.append(f"\n> {algo.upper()}: {b['objectiveFallback']}\n")
            top = sorted(w.items(), key=lambda kv: -kv[1])[:5]
            print(f"     top: " + ", ".join(f"{k} {v:.1%}" for k, v in top))

        lines += ["\n## Backtest walk-forward 12/3/3 (OOS)\n",
                  "| Algoritmo | Benchmark | Tiempo (s) | Sharpe | Sortino | MDD | Ret. acum. | Rotación | Sharpe bench. | Ret. bench. |",
                  "|---|---|---|---|---|---|---|---|---|---|"]
        print("\n[3] Backtest (/backtest)")
        for algo, rid in run_ids.items():
            for bench in ("equal_weight", "SPY"):
                t0 = time.time()
                r = await c.post("/backtest", json={"optimization_run_id": rid, "benchmark": bench, "cost_bps": a.cost_bps})
                dt = time.time() - t0
                check(r.status_code == 200, f"{algo} vs {bench}: HTTP {r.status_code} en {dt:.1f}s")
                if r.status_code != 200:
                    print("     ", r.text[:300]); continue
                b = r.json()
                bm = b["benchmark"]
                check(all(np.isfinite(b[k]) for k in ("sharpe", "sortino", "maxDrawdown", "cumulativeReturn")),
                      f"{algo} vs {bench}: métricas finitas")
                check(b["maxDrawdown"] <= 0 and len(b["windows"]) >= 4, f"{algo} vs {bench}: MDD≤0 y ≥4 ventanas ({len(b['windows'])})")
                check(dt < 45, f"{algo} vs {bench}: tiempo < 45 s")
                lines.append(f"| {algo.upper()} | {bench} | {dt:.1f} | {b['sharpe']:.2f} | {b['sortino']:.2f} | "
                             f"{b['maxDrawdown']:.1%} | {b['cumulativeReturn']:.1%} | {b['avgTurnover']:.2f} | "
                             f"{bm['sharpe']:.2f} | {bm['cumulativeReturn']:.1%} |")

        print("\n[4] Reproducibilidad (RNF-07): misma semilla → mismos pesos")
        r1 = (await c.post("/optimize", json={"portfolio_id": str(pid), "algorithm": "ga"})).json()
        r2 = (await c.post("/optimize", json={"portfolio_id": str(pid), "algorithm": "ga"})).json()
        check(r1["weights"] == r2["weights"], "dos corridas GA idénticas")

        print("\n[5] Validación de entrada")
        r = await c.post("/optimize", json={"portfolio_id": str(pid), "algorithm": "ga", "params": {"population_size": 10**9}})
        check(r.status_code == 422, "hiperparámetro absurdo → 422")

    passed = sum(ok for ok, _ in checks)
    lines += [f"\n## Verificaciones automáticas: {passed}/{len(checks)}\n"] + [f"- {'✔' if ok else '✘'} {m}" for ok, m in checks]
    (ROOT / "smoke_report.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"\nResultado: {passed}/{len(checks)} verificaciones OK → {ROOT / 'smoke_report.md'}")
    DB_FILE.unlink(missing_ok=True)
    return 0 if passed == len(checks) else 1


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--tickers", nargs="+", default=DEFAULT_TICKERS)
    ap.add_argument("--max-assets", type=int, default=5)
    ap.add_argument("--cap", type=float, default=0.4, help="peso máximo por activo")
    ap.add_argument("--cost-bps", type=float, default=10.0)
    ap.add_argument("--offline", action="store_true")
    sys.exit(asyncio.run(main(ap.parse_args())))
