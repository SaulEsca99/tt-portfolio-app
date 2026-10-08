import numpy as np
import pandas as pd
import pytest

from app.backtesting.walk_forward import (
    WalkForwardConfig,
    compute_metrics,
    equal_weight_strategy,
    make_markowitz_strategy,
    run_walk_forward,
)



def _prices(n_days=900, n_assets=4, seed=0):
    rng = np.random.default_rng(seed)
    idx = pd.bdate_range("2021-01-01", periods=n_days)
    r = rng.normal(0.0004, 0.01, size=(n_days, n_assets))
    return pd.DataFrame(100 * np.exp(np.cumsum(r, axis=0)), index=idx, columns=list("ABCD")[:n_assets])


def test_metrics_known_values():
    r = pd.Series([0.01, -0.02, 0.03, 0.0, -0.01], index=pd.bdate_range("2024-01-01", periods=5))
    m = compute_metrics(r)
    eq = (1 + r).cumprod()
    assert m.cumulative_return == pytest.approx(eq.iloc[-1] - 1)
    # drawdown: pico 1.01*... tras el día 1, cae -2 %
    assert m.max_drawdown == pytest.approx(min(eq / np.maximum.accumulate(np.r_[1.0, eq.values])[1:] - 1))
    assert m.sharpe == pytest.approx(r.mean() / r.std(ddof=1) * np.sqrt(252))
    down = np.sqrt(np.mean(np.minimum(r, 0) ** 2))
    assert m.sortino == pytest.approx(r.mean() * 252 / (down * np.sqrt(252)))


def test_constant_returns_have_zero_drawdown():
    r = pd.Series(0.001, index=pd.bdate_range("2024-01-01", periods=50))
    assert compute_metrics(r).max_drawdown == 0.0


def test_no_lookahead_and_window_layout():
    prices = _prices()
    seen = []

    def spy(train):
        seen.append((train.index[0], train.index[-1], len(train)))
        return equal_weight_strategy(train)

    m = run_walk_forward(prices, spy, WalkForwardConfig())
    assert len(m.windows) == len(seen) >= 6
    for w, (tr_start, tr_end, _) in zip(m.windows, seen):
        # el entrenamiento termina estrictamente antes del inicio de la ventana de prueba
        assert tr_end < pd.Timestamp(w["test_start"])
        assert pd.Timestamp(w["test_start"]) <= pd.Timestamp(w["test_end"])
    starts = [pd.Timestamp(w["test_start"]) for w in m.windows]
    assert starts == sorted(starts)
    # sin solapamiento entre ventanas de prueba
    ends = [pd.Timestamp(w["test_end"]) for w in m.windows]
    assert all(e < s for e, s in zip(ends[:-1], starts[1:]))


def test_equal_weight_matches_manual_computation():
    prices = _prices(n_days=400, n_assets=3)
    m = run_walk_forward(prices, equal_weight_strategy, WalkForwardConfig())
    first_test = pd.Timestamp(m.windows[0]["test_start"])
    rets = prices.pct_change()
    manual = rets.loc[first_test:].iloc[:5].mean(axis=1)  # 1/N diario
    got = m.equity_curve.pct_change().dropna().loc[first_test:].iloc[:5]
    assert np.allclose(manual.values, got.values)


def test_markowitz_strategy_valid_weights():
    prices = _prices(n_days=400)
    m = run_walk_forward(prices, make_markowitz_strategy(np.zeros(4), np.full(4, 0.5)),
                         WalkForwardConfig())
    for w in m.windows:
        ws = np.array(list(w["weights"].values()))
        assert ws.sum() == pytest.approx(1.0, abs=1e-6) and ws.max() <= 0.5 + 1e-6


def test_insufficient_history_raises():
    with pytest.raises(ValueError):
        run_walk_forward(_prices(n_days=100), equal_weight_strategy)


FAST = {"population_size": 20, "generations": 15}


@pytest.mark.parametrize("benchmark", ["equal_weight", "markowitz", "AAA"])
async def test_backtest_endpoint(client, benchmark):
    opt = await client.post("/optimize", json={
        "portfolio_id": client.portfolio_id, "algorithm": "ga", "params": FAST})
    assert opt.status_code == 200, opt.text
    r = await client.post("/backtest", json={
        "optimization_run_id": opt.json()["optimizationRunId"], "benchmark": benchmark})
    assert r.status_code == 200, r.text
    b = r.json()
    assert b["maxDrawdown"] <= 0
    assert len(b["equityCurve"]) > 100 and len(b["windows"]) >= 4
    assert b["benchmark"]["name"] == benchmark
    assert b["equityCurve"][0]["portfolioValue"] == pytest.approx(10_000, rel=0.05)
    for k in ("sharpe", "sortino", "cumulativeReturn"):
        assert np.isfinite(b[k]) and np.isfinite(b["benchmark"][k])
    # cada ventana respeta max_assets = 3
    assert all(sum(v > 1e-6 for v in w["weights"].values()) <= 3 for w in b["windows"])


async def test_backtest_unknown_run_404(client):
    import uuid
    r = await client.post("/backtest", json={"optimization_run_id": str(uuid.uuid4())})
    assert r.status_code == 404


# ------------------------- C5: costos y rotación --------------------------

def test_costs_reduce_return_by_turnover():
    prices = _prices()
    free = run_walk_forward(prices, equal_weight_strategy)
    costly = run_walk_forward(prices, equal_weight_strategy, cost_bps=50)
    # 1/N con pesos constantes: solo la compra inicial (rotación 1.0) cuesta 50 pbs
    assert free.avg_turnover == pytest.approx(1 / len(free.windows))
    assert costly.windows[0]["turnover"] == pytest.approx(1.0)
    assert all(w["turnover"] == pytest.approx(0.0) for w in costly.windows[1:])
    assert costly.cumulative_return < free.cumulative_return
    assert (1 + free.cumulative_return) / (1 + costly.cumulative_return) == pytest.approx(1.005, rel=1e-3)


def test_turnover_of_alternating_strategy():
    prices = _prices()
    flip = {"i": 0}

    def alternating(train):
        flip["i"] += 1
        return np.array([1.0, 0, 0, 0]) if flip["i"] % 2 else np.array([0, 1.0, 0, 0])

    m = run_walk_forward(prices, alternating, cost_bps=10)
    assert [w["turnover"] for w in m.windows][:3] == pytest.approx([1.0, 2.0, 2.0])


async def test_backtest_endpoint_costs_and_light_budget(client):
    opt = await client.post("/optimize", json={
        "portfolio_id": client.portfolio_id, "algorithm": "ga", "params": FAST})
    rid = opt.json()["optimizationRunId"]
    a = (await client.post("/backtest", json={"optimization_run_id": rid})).json()
    b = (await client.post("/backtest", json={"optimization_run_id": rid, "cost_bps": 100})).json()
    assert a["costBps"] == 0 and b["costBps"] == 100
    assert b["cumulativeReturn"] < a["cumulativeReturn"]
    assert a["avgTurnover"] > 0 and all("turnover" in w for w in a["windows"])
    assert a["paramsUsed"]["population_size"] == 20   # respeta lo explícito
    bad = await client.post("/backtest", json={"optimization_run_id": rid, "cost_bps": 500})
    assert bad.status_code == 422


def test_light_params_defaults_and_overrides():
    from app.routers.backtest import _light_params
    assert _light_params("de", {}, 10) == {"population_size": 40, "max_generations": 60}
    assert _light_params("ga", {}, 50)["generations"] == 100
    assert _light_params("pso", {"num_particles": 90}, 10)["num_particles"] == 90
