# Prueba de humo local — 2026-10-08 18:31
Modo: OFFLINE (simulado) · tickers: AAPL, MSFT, NVDA, JPM, XOM, JNJ, PG, KO, AMZN, TSLA · max_assets=5 · cap=40%

Historial: 1304 días (2021-10-11 → 2026-10-08), 10 activos; excluidos: ninguno

Sharpe de referencia (SLSQP, sin límite de activos): **2.213**

## Optimización

| Algoritmo | Tiempo (s) | Sharpe | Retorno esp. | Riesgo | Activos>1% | Gap vs ref. | Objetivo |
|---|---|---|---|---|---|---|---|
| GA | 1.1 | 2.167 | 20.30% | 9.37% | 5 | +2.1% | sharpe |
| PSO | 0.9 | 2.167 | 20.30% | 9.37% | 5 | +2.1% | sharpe |
| DE | 1.5 | 2.167 | 20.30% | 9.37% | 5 | +2.1% | sharpe |

## Backtest walk-forward 12/3/3 (OOS)

| Algoritmo | Benchmark | Tiempo (s) | Sharpe | Sortino | MDD | Ret. acum. | Rotación | Sharpe bench. | Ret. bench. |
|---|---|---|---|---|---|---|---|---|---|
| GA | equal_weight | 2.0 | 1.71 | 2.65 | -8.9% | 87.5% | 0.60 | 2.04 | 63.1% |
| GA | SPY | 2.1 | 1.71 | 2.65 | -8.9% | 87.5% | 0.60 | 0.59 | 48.0% |
| PSO | equal_weight | 1.7 | 1.65 | 2.55 | -8.9% | 83.7% | 0.62 | 2.04 | 63.1% |
| PSO | SPY | 1.8 | 1.65 | 2.55 | -8.9% | 83.7% | 0.62 | 0.59 | 48.0% |
| DE | equal_weight | 3.1 | 1.71 | 2.65 | -8.9% | 87.4% | 0.60 | 2.04 | 63.1% |
| DE | SPY | 2.9 | 1.71 | 2.65 | -8.9% | 87.4% | 0.60 | 0.59 | 48.0% |

## Verificaciones automáticas: 42/42

- ✔ descargados 10/10 tickers (mínimo 3)
- ✔ ga: HTTP 200 en 1.1s
- ✔ ga: pesos suman 1 (1.00000000)
- ✔ ga: pesos dentro de [0, 40%]
- ✔ ga: 5 activos ≤ max_assets=5
- ✔ ga: tiempo < 30 s
- ✔ pso: HTTP 200 en 0.9s
- ✔ pso: pesos suman 1 (1.00000000)
- ✔ pso: pesos dentro de [0, 40%]
- ✔ pso: 5 activos ≤ max_assets=5
- ✔ pso: tiempo < 30 s
- ✔ de: HTTP 200 en 1.5s
- ✔ de: pesos suman 1 (1.00000000)
- ✔ de: pesos dentro de [0, 40%]
- ✔ de: 5 activos ≤ max_assets=5
- ✔ de: tiempo < 30 s
- ✔ ga vs equal_weight: HTTP 200 en 2.0s
- ✔ ga vs equal_weight: métricas finitas
- ✔ ga vs equal_weight: MDD≤0 y ≥4 ventanas (16)
- ✔ ga vs equal_weight: tiempo < 45 s
- ✔ ga vs SPY: HTTP 200 en 2.1s
- ✔ ga vs SPY: métricas finitas
- ✔ ga vs SPY: MDD≤0 y ≥4 ventanas (16)
- ✔ ga vs SPY: tiempo < 45 s
- ✔ pso vs equal_weight: HTTP 200 en 1.7s
- ✔ pso vs equal_weight: métricas finitas
- ✔ pso vs equal_weight: MDD≤0 y ≥4 ventanas (16)
- ✔ pso vs equal_weight: tiempo < 45 s
- ✔ pso vs SPY: HTTP 200 en 1.8s
- ✔ pso vs SPY: métricas finitas
- ✔ pso vs SPY: MDD≤0 y ≥4 ventanas (16)
- ✔ pso vs SPY: tiempo < 45 s
- ✔ de vs equal_weight: HTTP 200 en 3.1s
- ✔ de vs equal_weight: métricas finitas
- ✔ de vs equal_weight: MDD≤0 y ≥4 ventanas (16)
- ✔ de vs equal_weight: tiempo < 45 s
- ✔ de vs SPY: HTTP 200 en 2.9s
- ✔ de vs SPY: métricas finitas
- ✔ de vs SPY: MDD≤0 y ≥4 ventanas (16)
- ✔ de vs SPY: tiempo < 45 s
- ✔ dos corridas GA idénticas
- ✔ hiperparámetro absurdo → 422