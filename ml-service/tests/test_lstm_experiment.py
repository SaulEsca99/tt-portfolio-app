import pytest

pytest.importorskip("torch")

from scripts.lstm_walk_forward_experiment import SOURCES, evaluate, synthetic_prices  # noqa: E402


def test_experiment_runs_per_window_without_lookahead(monkeypatch):
    """Cada reentrenamiento del LSTM solo ve precios anteriores al inicio de la ventana de prueba."""
    import app.models.lstm_model as lm

    seen = []
    real = lm.train_model

    def spy(train, cfg=None):
        seen.append(train.index[-1])
        return real(train, cfg)

    monkeypatch.setattr(lm, "train_model", spy)
    prices = synthetic_prices("trending", n=3, T=700)
    out = evaluate(prices, "de", lstm_epochs=1, opt_params={"population_size": 10, "max_generations": 10})
    assert list(out.strategy) == ["equal_weight", *[f"de+{s}" for s in SOURCES]]
    assert out[["sharpe", "sortino", "avg_turnover"]].notna().all().all()
    assert len(seen) >= 3 and all(t < prices.index[-1] for t in seen)   # una vez por ventana, reutilizado por lstm y blend
    assert len(seen) == len(set(seen))
