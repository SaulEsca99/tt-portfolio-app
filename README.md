# 📊 TT — Optimización de Carteras de Inversión

Monorepo del trabajo terminal. Contiene dos servicios independientes que comparten la misma base de datos PostgreSQL (Supabase).

```
tt-portfolio-app/
├── web/          # Next.js 16 + React 19 + TypeScript  → Vercel
└── ml-service/   # FastAPI (Python)                    → Render
```

## Arquitectura rápida

```
Navegador → Next.js (Vercel)
                ↓ ML_SERVICE_API_KEY (interno, nunca al cliente)
            FastAPI (Render)
                ↓
            PostgreSQL (Supabase) ← ambos servicios comparten la misma BD
```

> Regla de frontera: el servicio Python **nunca** es accesible desde el navegador.  
> Solo el backend de Next.js puede llamarlo, usando `ML_SERVICE_API_KEY`.

## Módulos del dominio

| Módulo | RF | Descripción |
|---|---|---|
| Identity | RF-11 | Auth, sesiones, perfil (Better Auth) |
| Portfolio Builder | RF-06 | Configuración de portafolio, activos candidatos, restricciones |
| Optimization | RF-04, 05, 09 | GA / PSO / DE — ejecuta y muestra resultados |
| Backtesting | RF-07, 08 | Walk-Forward, comparación vs benchmarks |
| Assistant | RF-10 | Chat conversacional sobre resultados |
| Market Data | RF-01, 02 | Obtención y almacenamiento de precios históricos |

## Docs

- [`web/`](./web/README.md) — Setup del frontend / backend Next.js
- [`ml-service/`](./ml-service/README.md) — Setup del servicio Python

## Convenciones

- Commits: [Conventional Commits](https://www.conventionalcommits.org/)
- Carpetas: `kebab-case` | Componentes: `PascalCase` | Funciones: `camelCase`
- Regla de dependencia: `Client → Shared ← Server` (Next.js); Python nunca importa código de `web/`
