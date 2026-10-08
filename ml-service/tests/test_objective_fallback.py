"""C1 — con retornos esperados ≤ 0 el objetivo Sharpe se invertía (elegía el activo más volátil)."""
import uuid
from datetime import date, datetime, timedelta, timezone

import numpy as np
import pytest

from app.db.models import Asset, Portfolio, PortfolioCandidate, PriceHistory
from app.optimization.portfolio_math import max_feasible_return
from app.optimization.runner import run_algorithm

FAST = {"population_size": 40, "generations": 60, "num_particles": 40,
        "max_iterations": 60, "max_generations": 60}
N = 6
VOL = np.linspace(0.10, 0.40, N)
SIGMA = 0.3 * np.outer(VOL, VOL) + 0.7 * np.diag(VOL**2)
TICKERS = [f"A{i}" for i in range(N)]
LO, HI = np.zeros(N), np.ones(N)


def _run(mu, objective="sharpe", lo=LO, hi=HI, algo="de"):
    return run_algorithm(algo, TICKERS, np.asarray(mu, float), SIGMA, 2.0, lo, hi, None,
                         {**FAST, "seed": 1}, objective)


def test_max_feasible_return_is_a_greedy_lp():
    mu = np.array([0.10, 0.05, -0.02])
    assert max_feasible_return(mu, np.zeros(3), np.ones(3)) == pytest.approx(0.10)
    assert max_feasible_return(mu, np.zeros(3), np.full(3, 0.5)) == pytest.approx(0.5 * 0.10 + 0.5 * 0.05)
    # con mínimos obligatorios: 20 % forzado en el peor activo
    assert max_feasible_return(mu, np.array([0, 0, 0.2]), np.ones(3)) == pytest.approx(0.8 * 0.10 + 0.2 * -0.02)


@pytest.mark.parametrize("algo", ["ga", "pso", "de"])
def test_equal_negative_returns_fall_back_to_min_variance(algo):
    mu = np.full(N, -0.05)
    res = _run(mu, algo=algo)
    ref = _run(mu, "min_variance", algo=algo)
    w = np.array([res.weights[t] for t in TICKERS])
    assert res.objective == "min_variance" and res.objective_fallback
    assert res.expected_risk == pytest.approx(ref.expected_risk, rel=1e-6)
    assert res.expected_risk < 0.15          # antes: 0.40 (100 % en el activo más volátil)
    assert w[-1] < 0.01                      # casi nada en el más volátil


def test_all_negative_but_different_returns_also_fall_back():
    res = _run(np.linspace(-0.04, -0.12, N))
    assert res.objective == "min_variance"


def test_positive_returns_keep_sharpe_and_no_fallback():
    res = _run(np.full(N, 0.05))
    assert res.objective == "sharpe" and res.objective_fallback is None
    assert res.sharpe_ratio > 0


def test_mixed_returns_keep_sharpe():
    mu = np.array([-0.05, -0.05, -0.05, -0.05, -0.05, 0.08])
    res = _run(mu)
    assert res.objective == "sharpe" and res.expected_return > 0


def test_caps_that_force_negative_return_trigger_fallback():
    """Un activo positivo pero con tope 10 % no alcanza para compensar el resto."""
    mu = np.array([-0.2] * 5 + [0.01])
    hi = np.full(N, 1.0); hi[-1] = 0.10
    assert max_feasible_return(mu, LO, hi) < 0
    assert _run(mu, hi=hi).objective == "min_variance"


def test_explicit_objectives_are_untouched():
    for obj in ("min_variance", "utility"):
        res = _run(np.full(N, -0.05), obj)
        assert res.objective == obj and res.objective_fallback is None


# ------------------------------ endpoint ---------------------------------

async def _bearish_portfolio(sf):
    rng = np.random.default_rng(5)
    async with sf() as db:
        pid = uuid.uuid4()
        db.add(Portfolio(id=pid, user_id="user_1", name="bear", risk_aversion_lambda=2,
                         max_assets=None, created_at=datetime.now(timezone.utc)))
        days = [d for d in (date.today() - timedelta(days=i) for i in range(900, 0, -1)) if d.weekday() < 5]
        for k in range(4):
            a = Asset(id=uuid.uuid4(), ticker=f"BEAR{k}", name="b")
            db.add(a)
            db.add(PortfolioCandidate(id=uuid.uuid4(), portfolio_id=pid, asset_id=a.id,
                                      min_weight=0, max_weight=1))
            r = rng.normal(-0.0012, 0.006 + 0.004 * k, len(days))      # -26 %/año, vol creciente
            p = 100 * np.exp(np.cumsum(r))
            for d, px in zip(days, p):
                db.add(PriceHistory(id=uuid.uuid4(), asset_id=a.id, date=d, close=float(px),
                                    adj_close=float(px), source="t", fetched_at=datetime.now(timezone.utc)))
        await db.commit()
    return str(pid)


async def test_endpoint_reports_fallback(client, session_factory):
    pid = await _bearish_portfolio(session_factory)
    r = await client.post("/optimize", json={"portfolio_id": pid, "algorithm": "ga", "params": FAST})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["objective"] == "min_variance"
    assert body["objectiveFallback"] and "tasa libre de riesgo" in body["objectiveFallback"]
    # el activo menos volátil (BEAR0) domina
    top = body["weights"][0]
    assert top["ticker"] == "BEAR0" and top["weight"] > 0.5


async def test_endpoint_without_fallback_has_null_reason(client):
    r = await client.post("/optimize", json={"portfolio_id": client.portfolio_id,
                                             "algorithm": "de", "params": FAST})
    assert r.status_code == 200
    assert r.json()["objective"] == "sharpe" and r.json()["objectiveFallback"] is None
