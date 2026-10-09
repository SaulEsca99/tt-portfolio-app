import numpy as np
import pandas as pd
import pytest

from scripts.universe_study import paired_bootstrap, sharpe_of


def _series(mu, sd=0.01, n=1000, seed=0):
    return pd.Series(np.random.default_rng(seed).normal(mu, sd, n), index=pd.bdate_range("2021-01-01", periods=n))


def test_bootstrap_identical_series_is_not_significant():
    a = _series(0.0005)
    d, lo, hi, p = paired_bootstrap(a, a.copy())
    assert d == pytest.approx(0.0) and lo <= 0 <= hi and p > 0.5


def test_bootstrap_detects_large_real_difference():
    x = _series(0.0020, seed=1)
    y = _series(0.0000, seed=2)
    d, lo, hi, p = paired_bootstrap(x, y)
    assert d > 1 and lo > 0 and p < 0.01
    assert d == pytest.approx(sharpe_of(x.to_numpy()) - sharpe_of(y.to_numpy()))


def test_bootstrap_noise_rarely_significant():
    """Con H0 verdadera, ~5 % de falsos positivos como máximo (tolerancia amplia con 40 réplicas)."""
    hits = 0
    for s in range(40):
        a, b = _series(0.0004, seed=100 + s, n=750), _series(0.0004, seed=500 + s, n=750)
        hits += paired_bootstrap(a, b, n_boot=500)[3] < 0.05
    assert hits <= 6
