"""Pruebas de GA, DE y PSO con datos sintéticos."""
import numpy as np
import pytest

from app.optimization import de, ga, pso
from app.optimization.portfolio_math import (
    ledoit_wolf_cov,
    repair,
    sharpe_ratio,
)

N = 8
TICKERS = [f"T{i}" for i in range(N)]


@pytest.fixture(scope="module")
def market():
    rng = np.random.default_rng(7)
    T = 750
    drift = np.linspace(0.0002, 0.001, N)
    vol = np.linspace(0.008, 0.02, N)
    rets = rng.normal(drift, vol, size=(T, N))
    prices = 100 * np.exp(np.cumsum(rets, axis=0))
    prices = np.vstack([np.full(N, 100.0), prices])
    mu = np.log(prices[1:] / prices[:-1]).mean(axis=0) * 252
    return mu, ledoit_wolf_cov(prices)


FAST = {
    "ga": (ga, ga.GAConfig(population_size=40, generations=60, seed=1)),
    "de": (de, de.DEConfig(population_size=40, max_generations=60, seed=1)),
    "pso": (pso, pso.PSOConfig(num_particles=40, max_iterations=60, seed=1)),
}


def _w(res):
    return np.array([res.weights[t] for t in TICKERS])


@pytest.mark.parametrize("name", FAST)
def test_sum_bounds_and_beats_equal_weight(name, market):
    mu, sigma = market
    mod, cfg = FAST[name]
    cap = np.full(N, 0.4)
    res = mod.optimize(TICKERS, mu, sigma, max_weights=cap, config=cfg)
    w = _w(res)
    assert w.sum() == pytest.approx(1.0, abs=1e-9)
    assert (w >= -1e-12).all() and (w <= cap + 1e-9).all()
    ew = np.full(N, 1 / N)
    assert res.sharpe_ratio >= sharpe_ratio(ew, mu, sigma)
    assert len(res.convergence_history) > 0


@pytest.mark.parametrize("name", FAST)
def test_cardinality(name, market):
    mu, sigma = market
    mod, cfg = FAST[name]
    res = mod.optimize(TICKERS, mu, sigma, max_assets=3, config=cfg)
    w = _w(res)
    assert (w > 1e-9).sum() <= 3
    assert w.sum() == pytest.approx(1.0, abs=1e-9)


@pytest.mark.parametrize("name", FAST)
def test_reproducible_with_seed(name, market):
    mu, sigma = market
    mod, cfg = FAST[name]
    a = mod.optimize(TICKERS, mu, sigma, config=cfg)
    b = mod.optimize(TICKERS, mu, sigma, config=cfg)
    assert a.weights == b.weights


@pytest.mark.parametrize("name", FAST)
def test_min_variance_objective(name, market):
    mu, sigma = market
    mod, cfg = FAST[name]
    res = mod.optimize(TICKERS, mu, sigma, objective="min_variance", config=cfg)
    ew = np.full(N, 1 / N)
    assert res.expected_risk <= np.sqrt(ew @ sigma @ ew)


def test_infeasible_bounds_raise(market):
    mu, sigma = market
    with pytest.raises(ValueError):
        ga.optimize(TICKERS, mu, sigma, max_weights=np.full(N, 0.05))
    with pytest.raises(ValueError):
        ga.optimize(TICKERS, mu, sigma, max_weights=np.full(N, 0.3), max_assets=2)


def test_repair_enforces_everything():
    rng = np.random.default_rng(0)
    lo, hi = np.zeros(N), np.full(N, 0.35)
    for _ in range(500):
        w = repair(rng.normal(size=N), lo, hi, 4)
        assert w.sum() == pytest.approx(1.0, abs=1e-9)
        assert (w <= hi + 1e-9).all() and (w > 1e-12).sum() <= 4
