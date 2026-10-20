# 🐍 ml-service — Servicio de Optimización e IA

Servicio FastAPI que expone los algoritmos de optimización (GA/PSO/DE), el modelo LSTM y el backtesting. **Solo es accesible desde el backend de Next.js**, nunca desde el navegador.

## Estructura

```
ml-service/
├── app/
│   ├── main.py               # Entrypoint FastAPI
│   ├── core/
│   │   ├── config.py         # Variables de entorno (pydantic-settings)
│   │   └── security.py       # Validación de ML_SERVICE_API_KEY
│   ├── data/
│   │   ├── fetch_yfinance.py        # Descarga de precios con yfinance
│   │   ├── fetch_alpha_vantage.py   # Fuente de respaldo / validación
│   │   └── price_updater.py         # Job diario incremental (RF-01, RF-02)
│   ├── models/
│   │   ├── lstm_model.py     # Features, entrenamiento (PyTorch) e inferencia (NumPy)
│   │   └── train.py          # Job de reentrenamiento mensual (guarda pesos en la BD)
│   ├── optimization/
│   │   ├── portfolio_math.py # Retornos log, Ledoit-Wolf, fitness, repair (cotas + cardinalidad)
│   │   ├── common.py         # OptimizationResult y validación de cotas
│   │   ├── runner.py         # Despacho GA/PSO/DE (Strategy)
│   │   ├── ga.py             # Algoritmo Genético (RF-04/05)
│   │   ├── pso.py            # Particle Swarm Optimization
│   │   └── de.py             # Differential Evolution (rand/1/bin)
│   ├── services/
│   │   ├── market_data.py    # Matriz de precios diaria desde la BD + benchmarks
│   │   └── lstm_service.py   # Último modelo LSTM y vector μ para el optimizador
│   ├── backtesting/
│   │   └── walk_forward.py   # Walk-forward 12/3/3, Sharpe/Sortino/MDD, benchmarks
│   ├── db/
│   │   ├── models.py         # SQLAlchemy — mismo esquema que Drizzle
│   │   └── session.py        # Conexión a PostgreSQL (Supabase)
│   └── routers/
│       ├── optimize.py       # POST /optimize
│       ├── backtest.py       # POST /backtest
│       ├── predict.py        # POST /predict
│       └── assets.py         # GET /assets, POST /assets/fetch
├── tests/
├── requirements.txt          # servicio web (sin torch)
├── requirements-train.txt    # + torch, solo para entrenar el LSTM
├── requirements-dev.txt
├── .env.example
├── render.yaml               # Configuración de servicios en Render
└── README.md
```

## Setup local

```bash
# 1. Crear entorno virtual
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 3. Copiar y rellenar variables de entorno
cp .env.example .env

# 4. Levantar el servidor de desarrollo
uvicorn app.main:app --reload --port 8000
```

La API estará en `http://localhost:8000`  
Documentación interactiva: `http://localhost:8000/docs`

## Endpoints principales

| Método | Ruta | Descripción | RF |
|---|---|---|---|
| POST | `/optimize` | Ejecuta GA/PSO/DE con los candidatos del portafolio | RF-04, 05 |
| POST | `/backtest` | Walk-Forward Analysis del resultado de optimización | RF-07, 08 |
| POST | `/predict` | Inferencia LSTM para μ, σ de un activo | RF-03 |
| POST | `/assets/fetch` | Fetch on-demand de un ticker nuevo | RF-01 |
| GET  | `/health` | Health check (para Render) | — |

## Algoritmos y decisiones de diseño

- **Datos**: precios diarios ajustados de los últimos 5 años; anualización con 252 días.
- **Σ**: estimador de Ledoit-Wolf. **μ**: histórico (por defecto), LSTM o mezcla 50/50
  (`mu_source` en `POST /optimize`). La anualización del retorno predicho por el LSTM
  (`r̂ · 252 / h`) amplifica el ruido: compara siempre contra el histórico antes de usarlo.
- **Restricciones**: suma 1, cotas por activo y cardinalidad `max_assets`, aplicadas con
  `portfolio_math.repair` tras cada operador (GA, PSO y DE usan la misma función).
- **Reproducibilidad (RNF-07)**: semilla fija por defecto (`seed=42`) en los tres algoritmos.
- **Backtesting**: en cada ventana (12 m entrenamiento / 3 m prueba / paso 3 m) se re-ejecuta
  el algoritmo con datos previos y se evalúa fuera de muestra. Benchmarks: `equal_weight`,
  `markowitz` (SLSQP, máx. Sharpe), `sp500` (SPY) o cualquier ticker. El backtest usa μ
  histórico por ventana (el LSTM global estaría entrenado con datos posteriores).
- **LSTM**: modelo global (5 features, ventana 30, horizonte 5), escalado ajustado solo con
  train. Se entrena fuera del servicio y los pesos viven en `lstm_model.weights_base64`;
  Render hace la inferencia con NumPy (sin torch).

## Pruebas

```bash
pip install -r requirements.txt -r requirements-dev.txt
pip install torch --index-url https://download.pytorch.org/whl/cpu   # opcional: pruebas del LSTM
python -m pytest tests -q
```

Los tests de routers usan SQLite en memoria con datos sintéticos (no tocan Supabase).

## Despliegue

- **Render** (`render.yaml`): solo el Web Service FastAPI.
- **GitHub Actions** (gratis): `price-update.yml` (diario) y `lstm-retrain.yml` (mensual).
  Configura los secrets `DATABASE_URL`, `ML_SERVICE_API_KEY` y `ALPHA_VANTAGE_API_KEY`.
- Tras actualizar el esquema Drizzle (columna `lstm_model.weights_base64`) ejecuta
  `pnpm db:generate && pnpm db:migrate` (o `pnpm db:push`) en `web/`.
