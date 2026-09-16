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
│   │   ├── lstm_model.py     # Arquitectura LSTM (TF/PyTorch)
│   │   └── train.py          # Job de reentrenamiento mensual
│   ├── optimization/
│   │   ├── ga.py             # Algoritmo Genético (RF-04/05)
│   │   ├── pso.py            # Particle Swarm Optimization
│   │   └── de.py             # Differential Evolution
│   ├── backtesting/
│   │   └── walk_forward.py   # Walk-Forward Analysis (Sección 4.6.4 TT)
│   ├── db/
│   │   ├── models.py         # SQLAlchemy — mismo esquema que Drizzle
│   │   └── session.py        # Conexión a PostgreSQL (Supabase)
│   └── routers/
│       ├── optimize.py       # POST /optimize
│       ├── backtest.py       # POST /backtest
│       ├── predict.py        # POST /predict
│       └── assets.py         # GET /assets, POST /assets/fetch
├── tests/
├── requirements.txt
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

## Despliegue en Render

Se usan **3 servicios** en Render (ver `render.yaml`):
1. **Web Service** — `uvicorn app.main:app` (atiende peticiones de Next.js)
2. **Cron Job diario** — `python -m app.data.price_updater` (después del cierre de NY)
3. **Cron Job mensual** — `python -m app.models.train` (día 1 de cada mes)

> ⚠️ El free tier de Render "duerme" el Web Service después de 15 min sin tráfico.  
> La primera petición tras inactividad puede tardar ~30-50 s. Los Cron Jobs no se ven afectados.
