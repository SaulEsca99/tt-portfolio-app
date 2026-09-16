# TT Portfolio App 📈

Una plataforma moderna e inteligente para la **construcción, optimización y backtesting de portafolios de inversión**. 

Este proyecto utiliza algoritmos cuantitativos (Algoritmo Genético, Enjambre de Partículas, Evolución Diferencial) para encontrar la asignación óptima de activos basada en el perfil de riesgo del usuario, y ofrece un asistente inteligente (Aperture AI) para tomar decisiones financieras informadas.

## 🚀 Tecnologías

El proyecto está dividido en un monorepo (Frontend Web y Microservicio ML):

### Frontend (Next.js)
- **Framework:** Next.js 16 (App Router) + React 19
- **Estilos:** Tailwind CSS 4 + shadcn/ui
- **Gráficas:** Recharts
- **Autenticación:** Better Auth
- **Base de Datos / ORM:** Supabase (PostgreSQL) + Drizzle ORM
- **Lenguaje:** TypeScript

### Backend (Motor de ML/Optimización)
- **Framework:** FastAPI (Python)
- **Librerías Financieras:** yfinance, pandas, numpy, scikit-learn
- **Datos de Mercado:** Alpha Vantage, Yahoo Finance API

## 🧩 Estructura del Proyecto

```text
tt-portfolio-app/
├── web/              # Frontend en Next.js
│   ├── src/app/      # Rutas de la aplicación (Dashboard, Auth, etc.)
│   ├── src/client/   # Componentes UI (shadcn, gráficas, layouts)
│   └── src/server/   # Lógica de backend (Better Auth, Drizzle Schema)
│
├── ml-service/       # Microservicio Python
│   ├── app/          # Endpoints de FastAPI (optimize, backtest, predict)
│   └── requirements/ # Dependencias de Anaconda/Python
│
└── README.md
```

## 🛠️ Cómo Correr el Proyecto (Desarrollo)

### 1. Iniciar el Motor de Python (FastAPI)
Asegúrate de tener un entorno con Python (ej. Anaconda) y las dependencias instaladas.
```bash
cd ml-service
uvicorn app.main:app --reload --port 8000
```

### 2. Iniciar el Frontend (Next.js)
```bash
cd web
pnpm install
pnpm dev
```
La aplicación estará disponible en `http://localhost:3000`.

## 📊 Vistas Principales

1. **Dashboard:** Visión general de los portafolios y su desempeño en tiempo real.
2. **Portfolio Builder:** Constructor de estrategias ajustando el perfil de riesgo.
3. **Optimización:** Herramientas cuantitativas para hallar la *frontera eficiente*.
4. **Backtesting:** Evaluación histórica del rendimiento (Equity Curve vs Benchmark).
5. **Market Data:** Datos de mercado en vivo y predicciones a corto plazo con LSTM.
6. **AI Assistant:** Chatbot para consultar métricas y recibir recomendaciones de balanceo.
