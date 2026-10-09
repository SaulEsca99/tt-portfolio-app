# Guía de pruebas y resultados — motor ML (rama `feat/ml-algorithms`)

Proyecto: Optimización de carteras con algoritmos bioinspirados (GA, PSO, DE) y LSTM — TT ESCOM-IPN.

> **IMPORTANTE:** probar siempre desde la rama `feat/ml-algorithms`. **No** hacer merge a `main`
> (Vercel despliega `main` directo a producción). Nada de esta guía toca Supabase ni producción.

## 1. Qué se hizo
- GA, PSO y DE reales (codificación real, reparación de pesos: límites, cardinalidad, suma = 1), semilla reproducible.
- Endpoint `/optimize` (objetivos Sharpe / mínima varianza / utilidad, con fallback documentado) y validación de hiperparámetros (422).
- Backtest walk-forward 12/3/3 con costos de transacción (`cost_bps`), rotación y benchmarks (1/N, SPY).
- LSTM global (5 variables, ventana 30, horizonte 5) con inferencia en NumPy y calibración de μ.
- Limpieza de datos de Yahoo (barra del día incompleta con NaN).
- Scripts de prueba con datos reales y estudio estadístico (bootstrap pareado).
- 90+ pruebas automáticas.

## 2. Preparar el entorno
```bash
git clone https://github.com/SaulEsca99/tt-portfolio-app.git
cd tt-portfolio-app
git checkout feat/ml-algorithms
cd ml-service
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt     # ambos archivos
```
Requiere Python 3.11+ y ~1 GB libre. **No** hace falta instalar torch para los pasos 3–5
(solo para reentrenar el LSTM: `requirements-train.txt`, ~2 GB).

## 3. Pruebas automáticas (sin internet)
```bash
python -m pytest tests -q
```
Resultado esperado: todas en verde (90+).

## 4. Prueba de humo con datos reales (necesita internet a Yahoo Finance)
```bash
python -m scripts.local_smoke_test --tickers AAPL MSFT NVDA JPM XOM JNJ PG KO AMZN TSLA --max-assets 5 --cap 0.4
```
Usa SQLite local (se niega a correr contra otra BD). Genera `smoke_report.md`.
Esperado: **42/42 verificaciones OK**, GA/PSO/DE con Sharpe ≈ 1.49 y < 1 s cada uno.
Sin internet: añadir `--offline` (datos simulados, solo valida el script).

## 5. Estudio por universos (significancia y costos)
```bash
python -m scripts.universe_study
```
Genera `universe_study.md`: Sharpe, drawdown, p-values (bootstrap pareado) y costo de equilibrio por universo.

## 6. (Opcional) Experimento LSTM
```bash
python -m scripts.export_prices          # descarga precios a data_prices/*.csv
pip install -r requirements-train.txt    # instala torch
python -m scripts.lstm_walk_forward_experiment --csv data_prices/<universo>.csv --epochs 20
```

## 7. Qué reportar de vuelta
1. Salida de `pytest` (pasaron/fallaron).
2. `smoke_report.md` y `universe_study.md`.
3. Cualquier error con el comando exacto y su traceback.
4. Tu SO y versión de Python.

## 8. Resultados obtenidos (datos reales de Yahoo, ventana ~2021-10 a 2026-10)

**Optimización (10 acciones, tope 40 %, máx. 5 activos):**

| Algoritmo | Tiempo | Sharpe | Gap vs SLSQP |
|---|---|---|---|
| GA | 0.7 s | 1.494 | 0.0 % |
| PSO | 0.6 s | 1.494 | 0.0 % |
| DE | 0.9 s | 1.494 | 0.0 % |

Los tres algoritmos alcanzan el óptimo de referencia (SLSQP, Markowitz) en menos de 1 s y son reproducibles (dos corridas idénticas).

**Backtest walk-forward 12/3/3 (fuera de muestra, 16 ventanas):**

| Algoritmo | Sharpe | Sortino | MDD | Ret. acum. | Rotación |
|---|---|---|---|---|---|
| GA | 1.72 | 2.73 | −17.9 % | 186.9 % | 0.72 |
| PSO | 1.67 | 2.64 | −18.0 % | 178.6 % | 0.72 |
| DE | 1.67 | 2.63 | −18.0 % | 177.5 % | 0.72 |
| 1/N (benchmark) | 1.77 | — | — | 199.4 % | — |
| SPY | 1.42 | — | — | 128.6 % | — |

**Estudio por universos (27 configuraciones, bootstrap pareado):**
- Los optimizadores superan a 1/N en Sharpe en 25 de 27 configuraciones, pero **ninguna diferencia es estadísticamente significativa** (p entre 0.27 y 1.00; mayor ΔSharpe +0.27, p = 0.40).
- El drawdown es consistentemente menor (p. ej. −16.5 % vs −23.7 %).
- Costo de equilibrio: 84–164 pb en acciones grandes y defensivo; solo 11–50 pb en ETF sectoriales.
- GA/PSO/DE ≈ Markowitz (52 % de victorias = empate técnico).

**Conclusión:** los algoritmos bioinspirados alcanzan el óptimo de Markowitz, igualan o superan ligeramente a 1/N con menor drawdown, pero la ventaja no es concluyente estadísticamente; el resultado depende del periodo. Limitaciones: sesgo de supervivencia en los universos y μ calculado con retornos históricos.

## 9. Pendientes antes de producción
- Migración Drizzle de `weights_base64` (no ejecutada en prod).
- Secrets de GitHub Actions y variables de entorno del preview (verificar que no apunten a prod).
- Vistas web: selector de algoritmo y Sharpe/Sortino en lugar de Win Rate.
- Verificar plan de Vercel para `maxDuration = 60`.
- Experimento LSTM con datos reales (pendiente de espacio en disco).
