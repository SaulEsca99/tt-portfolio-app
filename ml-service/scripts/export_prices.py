"""
Exporta a CSV los precios ajustados de los universos del estudio (sin BD, sin torch).

    python -m scripts.export_prices          # escribe data_prices/<universo>.csv

Sirve para correr experimentos pesados (p. ej. el LSTM) en otra máquina sin repetir la descarga.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from scripts.universe_study import UNIVERSES, load_prices  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--years", type=int, default=6)
    ap.add_argument("--out", default=str(ROOT / "data_prices"))
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    for name, tickers in UNIVERSES.items():
        df = load_prices(tickers, a.years, offline=False)
        df.to_csv(out / f"{name}.csv", index_label="date")
        print(f"{name}: {df.shape[1]} activos, {len(df)} días → {out / (name + '.csv')}")


if __name__ == "__main__":
    main()
