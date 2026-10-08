import uuid
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import pytest

torch = pytest.importorskip("torch")

from app.db.models import LstmModel  # noqa: E402
from app.models.lstm_model import (  # noqa: E402
    N_FEATURES,
    LstmConfig,
    LstmPredictor,
    build_features,
    make_sequences,
    train_model,
)


def _series(n=500, seed=0, drift=0.0004):
    rng = np.random.default_rng(seed)
    idx = pd.bdate_range("2022-01-03", periods=n)
    return pd.Series(100 * np.exp(np.cumsum(rng.normal(drift, 0.01, n))), index=idx)


def _matrix(n=500, k=4):
    return pd.DataFrame({f"S{i}": _series(n, seed=i) for i in range(k)})


def test_features_have_no_lookahead():
    s = _series(200)
    full = build_features(s)
    part = build_features(s.iloc[:150])
    assert np.allclose(full.iloc[:150].to_numpy(), part.to_numpy(), equal_nan=True)


def test_sequences_target_is_future_return():
    cfg = LstmConfig(sequence_length=30, horizon_days=5)
    s = _series(200)
    X, y, pos = make_sequences(s, cfg)
    assert X.shape[1:] == (30, N_FEATURES) and not np.isnan(X).any()
    t = pos[10]
    assert y[10] == pytest.approx(np.log(s.iloc[t + 5] / s.iloc[t]))
    assert pos.max() + cfg.horizon_days < len(s)


@pytest.mark.parametrize("layers", [1, 2])
def test_numpy_inference_matches_torch(layers):
    """La inferencia NumPy debe reproducir exactamente el forward de PyTorch."""
    from torch import nn

    cfg = LstmConfig(hidden_units=8, num_layers=layers, sequence_length=30)
    torch.manual_seed(0)
    lstm = nn.LSTM(N_FEATURES, cfg.hidden_units, layers, batch_first=True)
    head = nn.Linear(cfg.hidden_units, 1)
    sd = {**{f"lstm.{k}": v for k, v in lstm.state_dict().items()},
          **{f"head.{k}": v for k, v in head.state_dict().items()}}
    sd = {k: v.detach().numpy().astype(np.float64) for k, v in sd.items()}
    params = {}
    for k in range(layers):
        params[f"w_ih_{k}"] = sd[f"lstm.weight_ih_l{k}"]
        params[f"w_hh_{k}"] = sd[f"lstm.weight_hh_l{k}"]
        params[f"b_{k}"] = sd[f"lstm.bias_ih_l{k}"] + sd[f"lstm.bias_hh_l{k}"]
    params["head_w"], params["head_b"] = sd["head.weight"][0], sd["head.bias"]
    pred = LstmPredictor(cfg, params, {})

    x = np.random.default_rng(1).normal(size=(30, N_FEATURES))
    with torch.no_grad():
        out, _ = lstm(torch.tensor(x, dtype=torch.float32)[None])
        ref = float(head(out[:, -1]))
    assert pred._forward(x) == pytest.approx(ref, abs=1e-5)


def test_train_roundtrip_and_metrics():
    cfg = LstmConfig(hidden_units=8, epochs=3, batch_size=64)
    predictor, metrics = train_model(_matrix(), cfg)
    for k in ("val_mse", "val_mae", "val_r2", "baseline_mse", "directional_accuracy", "n_train", "n_val"):
        assert k in metrics and np.isfinite(metrics[k])
    blob = predictor.to_base64()
    again = LstmPredictor.from_base64(blob, predictor.hyperparameters())
    s = _matrix()["S0"]
    assert again.predict_return(s) == pytest.approx(predictor.predict_return(s))
    out = again.predict(s)
    assert out["predicted_risk"] > 0 and np.isfinite(out["predicted_return"])
    assert len(blob) < 200_000  # cabe holgado en una columna de texto


def test_scaler_fit_on_train_only():
    """Con datos de validación extremos, las estadísticas de escalado no cambian."""
    base = _matrix()
    cfg = LstmConfig(hidden_units=4, epochs=1)
    p1, _ = train_model(base, cfg)
    spiked = base.copy()
    spiked.iloc[-60:] *= 5.0  # tramo final (validación) distorsionado
    p2, _ = train_model(spiked, cfg)
    assert np.allclose(p1.scaler["x_mean"][0], p2.scaler["x_mean"][0], atol=1e-3)


def test_insufficient_data_raises():
    with pytest.raises(ValueError):
        train_model(_matrix(n=60, k=1), LstmConfig(epochs=1))


# ---------------------------- endpoints --------------------------------

async def _store_model(session_factory, prices):
    predictor, metrics = train_model(prices, LstmConfig(hidden_units=8, epochs=2))
    async with session_factory() as db:
        db.add(LstmModel(id=uuid.uuid4(), version="v1.test", hyperparameters=predictor.hyperparameters(),
                         metrics=metrics, weights_base64=predictor.to_base64(),
                         trained_at=datetime.now(timezone.utc)))
        await db.commit()


async def _prices_from_db(session_factory):
    from sqlalchemy import select

    from app.db.models import Asset
    from app.services.market_data import load_price_matrix

    async with session_factory() as db:
        ids = [a.id for a in (await db.execute(select(Asset))).scalars()]
        return await load_price_matrix(db, ids, align=False)


FAST = {"population_size": 20, "generations": 15}


async def test_predict_endpoint_and_cache(client, session_factory):
    r = await client.post("/predict", json={"ticker": "AAA"})
    assert r.status_code == 503                      # aún sin modelo
    await _store_model(session_factory, await _prices_from_db(session_factory))
    r = await client.post("/predict", json={"ticker": "AAA", "horizon_days": 21})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["modelVersion"] == "v1.test" and body["horizonDays"] == 21
    assert body["predictedRisk"] > 0
    r2 = await client.post("/predict", json={"ticker": "AAA", "horizon_days": 21})
    assert r2.json()["predictedReturn"] == pytest.approx(body["predictedReturn"], abs=1e-5)


async def test_optimize_mu_sources(client, session_factory):
    base = {"portfolio_id": client.portfolio_id, "algorithm": "de", "params": FAST}
    r = await client.post("/optimize", json={**base, "mu_source": "lstm"})
    assert r.status_code == 409                      # sin modelo entrenado
    await _store_model(session_factory, await _prices_from_db(session_factory))
    res = {}
    for src in ("historical", "lstm", "blend"):
        r = await client.post("/optimize", json={**base, "mu_source": src})
        assert r.status_code == 200, r.text
        res[src] = r.json()
        assert sum(w["weight"] for w in res[src]["weights"]) == pytest.approx(1.0, abs=1e-4)
    assert res["historical"]["muSource"] == "historical"
    assert res["lstm"]["muSource"] == "lstm:v1.test"
    assert res["blend"]["muSource"] == "blend:v1.test"
