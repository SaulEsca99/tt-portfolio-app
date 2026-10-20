# Prueba de humo local — 2026-10-08 18:40
Modo: Yahoo Finance real · tickers: AAPL, MSFT, NVDA, JPM, XOM, JNJ, PG, KO, AMZN, TSLA · max_assets=5 · cap=40%

Historial: 1253 días (2021-10-11 → 2026-10-07), 10 activos; excluidos: ninguno

Sharpe de referencia (SLSQP, sin límite de activos): **1.494**

## Optimización

| Algoritmo | Tiempo (s) | Sharpe | Retorno esp. | Riesgo | Activos>1% | Gap vs ref. | Objetivo |
|---|---|---|---|---|---|---|---|
| GA | 0.7 | 1.494 | 22.28% | 14.92% | 4 | -0.0% | sharpe |
| PSO | 0.6 | 1.494 | 22.28% | 14.92% | 4 | -0.0% | sharpe |
| DE | 0.9 | 1.494 | 22.28% | 14.92% | 4 | -0.0% | sharpe |

## Backtest walk-forward 12/3/3 (OOS)

| Algoritmo | Benchmark | Tiempo (s) | Sharpe | Sortino | MDD | Ret. acum. | Rotación | Sharpe bench. | Ret. bench. |
|---|---|---|---|---|---|---|---|---|---|
| GA | equal_weight | 1.4 | 1.72 | 2.73 | -17.9% | 186.9% | 0.72 | 1.77 | 199.4% |
| GA | SPY | 1.4 | 1.72 | 2.73 | -17.9% | 186.9% | 0.72 | 1.42 | 128.6% |
| PSO | equal_weight | 1.1 | 1.67 | 2.64 | -18.0% | 178.6% | 0.72 | 1.77 | 199.4% |
| PSO | SPY | 1.4 | 1.67 | 2.64 | -18.0% | 178.6% | 0.72 | 1.42 | 128.6% |
| DE | equal_weight | 2.1 | 1.67 | 2.63 | -18.0% | 177.5% | 0.72 | 1.77 | 199.4% |
| DE | SPY | 2.0 | 1.67 | 2.63 | -18.0% | 177.5% | 0.72 | 1.42 | 128.6% |

## Verificaciones automáticas: 42/42

- ✔ descargados 10/10 tickers (mínimo 3)
- ✔ ga: HTTP 200 en 0.7s
- ✔ ga: pesos suman 1 (1.00000000)
- ✔ ga: pesos dentro de [0, 40%]
- ✔ ga: 5 activos ≤ max_assets=5
- ✔ ga: tiempo < 30 s
- ✔ pso: HTTP 200 en 0.6s
- ✔ pso: pesos suman 1 (1.00000000)
- ✔ pso: pesos dentro de [0, 40%]
- ✔ pso: 5 activos ≤ max_assets=5
- ✔ pso: tiempo < 30 s
- ✔ de: HTTP 200 en 0.9s
- ✔ de: pesos suman 1 (1.00000000)
- ✔ de: pesos dentro de [0, 40%]
- ✔ de: 5 activos ≤ max_assets=5
- ✔ de: tiempo < 30 s
- ✔ ga vs equal_weight: HTTP 200 en 1.4s
- ✔ ga vs equal_weight: métricas finitas
- ✔ ga vs equal_weight: MDD≤0 y ≥4 ventanas (16)
- ✔ ga vs equal_weight: tiempo < 45 s
- ✔ ga vs SPY: HTTP 200 en 1.4s
- ✔ ga vs SPY: métricas finitas
- ✔ ga vs SPY: MDD≤0 y ≥4 ventanas (16)
- ✔ ga vs SPY: tiempo < 45 s
- ✔ pso vs equal_weight: HTTP 200 en 1.1s
- ✔ pso vs equal_weight: métricas finitas
- ✔ pso vs equal_weight: MDD≤0 y ≥4 ventanas (16)
- ✔ pso vs equal_weight: tiempo < 45 s
- ✔ pso vs SPY: HTTP 200 en 1.4s
- ✔ pso vs SPY: métricas finitas
- ✔ pso vs SPY: MDD≤0 y ≥4 ventanas (16)
- ✔ pso vs SPY: tiempo < 45 s
- ✔ de vs equal_weight: HTTP 200 en 2.1s
- ✔ de vs equal_weight: métricas finitas
- ✔ de vs equal_weight: MDD≤0 y ≥4 ventanas (16)
- ✔ de vs equal_weight: tiempo < 45 s
- ✔ de vs SPY: HTTP 200 en 2.0s
- ✔ de vs SPY: métricas finitas
- ✔ de vs SPY: MDD≤0 y ≥4 ventanas (16)
- ✔ de vs SPY: tiempo < 45 s
- ✔ dos corridas GA idénticas
- ✔ hiperparámetro absurdo → 422