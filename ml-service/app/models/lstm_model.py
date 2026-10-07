"""
Modelo LSTM para predicción del retorno esperado por activo (RF-03).

Diseño:
  - Un único modelo global entrenado con las secuencias de todos los activos.
  - Entrada: ventana de `sequence_length` días × 5 features derivadas del precio.
  - Salida: retorno logarítmico acumulado a `horizon_days` días.
  - Escalado (media/desv.) ajustado SOLO con el tramo de entrenamiento.
  - Entrenamiento con PyTorch (import perezoso, solo en el job de reentrenamiento).
  - Inferencia en NumPy puro: el servicio web en Render free (512 MB) no necesita torch.
  - Los pesos se serializan a base64 (npz comprimido) y viven en lstm_model.weights_base64.
"""
from __future__ import annotations

import base64
import io
import logging
from dataclasses import asdict, dataclass

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

FEATURES = ["log_ret", "vol_10", "vol_30", "mom_10", "rsi_14"]
N_FEATURES = len(FEATURES)


@dataclass
class LstmConfig:
    sequence_length: int = 30      # días de ventana de contexto
    hidden_units: int = 32
    num_layers: int = 1
    dropout: float = 0.0           # solo entre capas (requiere num_layers > 1)
    horizon_days: int = 5          # horizonte de predicción (días de trading)
    learning_rate: float = 0.001
    epochs: int = 30
    batch_size: int = 64
    train_fraction: float = 0.8    # corte cronológico train/validación
    seed: int = 42


# ---------------------------------------------------------------------------
# Features y dataset
# ---------------------------------------------------------------------------

def build_features(prices: pd.Series) -> pd.DataFrame:
    """Features diarias a partir de una serie de precios ajustados."""
    p = prices.astype(float)
    lr = np.log(p / p.shift(1))
    delta = p.diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rsi = 100 - 100 / (1 + gain / loss.replace(0, np.nan))
    feats = pd.DataFrame(
        {
            "log_ret": lr,
            "vol_10": lr.rolling(10).std(),
            "vol_30": lr.rolling(30).std(),
            "mom_10": p / p.shift(10) - 1,
            "rsi_14": (rsi / 100).fillna(0.5),
        }
    )
    return feats


def make_sequences(
    prices: pd.Series, cfg: LstmConfig
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Devuelve (X, y, pos) para un activo:
      X   (n, L, F) ventanas de features
      y   (n,) retorno log acumulado a `horizon_days` desde el último día de la ventana
      pos (n,) posición (índice) del último día de cada ventana
    """
    feats = build_features(prices)
    F = feats.to_numpy(dtype=float)
    p = prices.to_numpy(dtype=float)
    L, h = cfg.sequence_length, cfg.horizon_days
    valid_start = int(np.argmax(~np.isnan(F).any(axis=1))) if (~np.isnan(F).any(axis=1)).any() else len(F)
    X, y, pos = [], [], []
    for t in range(max(valid_start + L - 1, L), len(p) - h):
        window = F[t - L + 1 : t + 1]
        if np.isnan(window).any():
            continue
        X.append(window)
        y.append(np.log(p[t + h] / p[t]))
        pos.append(t)
    if not X:
        return np.empty((0, L, N_FEATURES)), np.empty(0), np.empty(0, dtype=int)
    return np.asarray(X), np.asarray(y), np.asarray(pos)


# ---------------------------------------------------------------------------
# Inferencia en NumPy
# ---------------------------------------------------------------------------

def _sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


class LstmPredictor:
    """Modelo entrenado + escaladores. Inferencia NumPy; serializable a base64."""

    def __init__(self, config: LstmConfig, params: dict[str, np.ndarray], scaler: dict[str, np.ndarray]):
        self.config = config
        self.params = params      # pesos tipo PyTorch: w_ih_{k}, w_hh_{k}, b_{k}, head_w, head_b
        self.scaler = scaler      # x_mean (F,), x_std (F,), y_mean (1,), y_std (1,)

    # -- forward ---------------------------------------------------------
    def _forward(self, seq: np.ndarray) -> float:
        """seq: (L, F) ya escalado → salida escalada."""
        x = seq
        H = self.config.hidden_units
        for k in range(self.config.num_layers):
            w_ih, w_hh, b = self.params[f"w_ih_{k}"], self.params[f"w_hh_{k}"], self.params[f"b_{k}"]
            h = np.zeros(H)
            c = np.zeros(H)
            outs = []
            for step in x:
                z = w_ih @ step + w_hh @ h + b          # orden de compuertas PyTorch: i, f, g, o
                i, f, g, o = z[:H], z[H : 2 * H], z[2 * H : 3 * H], z[3 * H :]
                c = _sigmoid(f) * c + _sigmoid(i) * np.tanh(g)
                h = _sigmoid(o) * np.tanh(c)
                outs.append(h)
            x = np.asarray(outs)
        return float(self.params["head_w"] @ x[-1] + self.params["head_b"][0])

    def predict_return(self, prices: pd.Series) -> float:
        """Retorno log esperado a `horizon_days` para la última fecha de `prices`."""
        feats = build_features(prices).to_numpy(dtype=float)
        L = self.config.sequence_length
        window = feats[-L:]
        if len(window) < L or np.isnan(window).any():
            raise ValueError("Historial insuficiente para la ventana del LSTM.")
        scaled = (window - self.scaler["x_mean"]) / self.scaler["x_std"]
        out = self._forward(scaled)
        return float(out * self.scaler["y_std"][0] + self.scaler["y_mean"][0])

    def predict(self, prices: pd.Series) -> dict[str, float]:
        """
        {"predicted_return": retorno log esperado a horizon_days,
         "predicted_risk":   vol. diaria reciente (30 d) × √horizon_days}
        """
        r = self.predict_return(prices)
        vol = float(np.log(prices / prices.shift(1)).tail(30).std())
        return {"predicted_return": r, "predicted_risk": vol * np.sqrt(self.config.horizon_days)}

    # -- serialización -----------------------------------------------------
    def to_base64(self) -> str:
        buf = io.BytesIO()
        arrays = {**{f"p_{k}": v for k, v in self.params.items()},
                  **{f"s_{k}": v for k, v in self.scaler.items()}}
        np.savez_compressed(buf, **arrays)
        return base64.b64encode(buf.getvalue()).decode("ascii")

    @classmethod
    def from_base64(cls, blob: str, config: LstmConfig | dict) -> "LstmPredictor":
        if isinstance(config, dict):
            valid = LstmConfig.__dataclass_fields__.keys()
            config = LstmConfig(**{k: v for k, v in config.items() if k in valid})
        data = np.load(io.BytesIO(base64.b64decode(blob)))
        params = {k[2:]: data[k] for k in data.files if k.startswith("p_")}
        scaler = {k[2:]: data[k] for k in data.files if k.startswith("s_")}
        return cls(config, params, scaler)

    def hyperparameters(self) -> dict:
        return {**asdict(self.config), "features": FEATURES}


# ---------------------------------------------------------------------------
# Entrenamiento (PyTorch, import perezoso)
# ---------------------------------------------------------------------------

def train_model(
    price_matrix: pd.DataFrame, config: LstmConfig | None = None
) -> tuple[LstmPredictor, dict]:
    """
    Entrena el modelo global con las secuencias de todas las columnas de `price_matrix`.

    División cronológica por activo: primeras `train_fraction` observaciones → train;
    el resto → validación. Se purgan las ventanas de train cuyo objetivo cae en validación.
    Devuelve (predictor, métricas).
    """
    import torch
    from torch import nn

    cfg = config or LstmConfig()
    torch.manual_seed(cfg.seed)
    np.random.seed(cfg.seed)

    Xtr, ytr, Xva, yva = [], [], [], []
    for ticker in price_matrix.columns:
        s = price_matrix[ticker].dropna()
        X, y, pos = make_sequences(s, cfg)
        if len(X) == 0:
            logger.warning("Sin secuencias suficientes para %s", ticker)
            continue
        cut = int(len(s) * cfg.train_fraction)
        tr = pos + cfg.horizon_days <= cut
        va = pos >= cut
        Xtr.append(X[tr]); ytr.append(y[tr]); Xva.append(X[va]); yva.append(y[va])

    if not Xtr or sum(len(a) for a in Xtr) < 50 or sum(len(a) for a in Xva) < 10:
        raise ValueError("Datos insuficientes para entrenar el LSTM.")

    Xtr, ytr = np.concatenate(Xtr), np.concatenate(ytr)
    Xva, yva = np.concatenate(Xva), np.concatenate(yva)

    # Escalado ajustado SOLO con train
    x_mean = Xtr.reshape(-1, N_FEATURES).mean(axis=0)
    x_std = Xtr.reshape(-1, N_FEATURES).std(axis=0) + 1e-8
    y_mean, y_std = ytr.mean(keepdims=True), ytr.std(keepdims=True) + 1e-8
    sx = lambda X: ((X - x_mean) / x_std).astype(np.float32)  # noqa: E731
    sy = lambda y: ((y - y_mean[0]) / y_std[0]).astype(np.float32)  # noqa: E731

    class Net(nn.Module):
        def __init__(self):
            super().__init__()
            self.lstm = nn.LSTM(N_FEATURES, cfg.hidden_units, cfg.num_layers, batch_first=True,
                                dropout=cfg.dropout if cfg.num_layers > 1 else 0.0)
            self.head = nn.Linear(cfg.hidden_units, 1)

        def forward(self, x):
            out, _ = self.lstm(x)
            return self.head(out[:, -1]).squeeze(-1)

    net = Net()
    opt = torch.optim.Adam(net.parameters(), lr=cfg.learning_rate)
    loss_fn = nn.MSELoss()
    tx, ty = torch.from_numpy(sx(Xtr)), torch.from_numpy(sy(ytr))
    vx, vy = torch.from_numpy(sx(Xva)), torch.from_numpy(sy(yva))

    best_state, best_val = None, float("inf")
    gen = torch.Generator().manual_seed(cfg.seed)
    for epoch in range(cfg.epochs):
        net.train()
        perm = torch.randperm(len(tx), generator=gen)
        for i in range(0, len(tx), cfg.batch_size):
            idx = perm[i : i + cfg.batch_size]
            opt.zero_grad()
            loss_fn(net(tx[idx]), ty[idx]).backward()
            opt.step()
        net.eval()
        with torch.no_grad():
            val = float(loss_fn(net(vx), vy))
        if val < best_val:
            best_val = val
            best_state = {k: v.clone() for k, v in net.state_dict().items()}
    net.load_state_dict(best_state)  # early stopping por mejor validación

    net.eval()
    with torch.no_grad():
        pred = net(vx).numpy() * y_std[0] + y_mean[0]
    err = pred - yva
    ss_res, ss_tot = float((err**2).sum()), float(((yva - yva.mean()) ** 2).sum())
    baseline_mse = float(((yva - ytr.mean()) ** 2).mean())   # predecir siempre la media de train
    metrics = {
        "val_mse": float((err**2).mean()),
        "val_mae": float(np.abs(err).mean()),
        "val_r2": 1.0 - ss_res / ss_tot if ss_tot > 0 else 0.0,
        "baseline_mse": baseline_mse,
        "beats_baseline": bool((err**2).mean() < baseline_mse),
        "directional_accuracy": float((np.sign(pred) == np.sign(yva)).mean()),
        "n_train": int(len(tx)),
        "n_val": int(len(vx)),
    }

    sd = {k: v.numpy().astype(np.float64) for k, v in net.state_dict().items()}
    params: dict[str, np.ndarray] = {}
    for k in range(cfg.num_layers):
        params[f"w_ih_{k}"] = sd[f"lstm.weight_ih_l{k}"]
        params[f"w_hh_{k}"] = sd[f"lstm.weight_hh_l{k}"]
        params[f"b_{k}"] = sd[f"lstm.bias_ih_l{k}"] + sd[f"lstm.bias_hh_l{k}"]
    params["head_w"] = sd["head.weight"][0]
    params["head_b"] = sd["head.bias"]
    scaler = {"x_mean": x_mean, "x_std": x_std, "y_mean": y_mean, "y_std": y_std}
    return LstmPredictor(cfg, params, scaler), metrics
