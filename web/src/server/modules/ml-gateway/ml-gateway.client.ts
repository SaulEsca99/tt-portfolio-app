/**
 * ml-gateway — cliente HTTP interno hacia el servicio FastAPI (Python).
 *
 * REGLA DE FRONTERA: este módulo vive en `server/` y NUNCA es importado
 * desde `client/`. Solo las API routes de Next.js lo llaman.
 *
 * Autenticación: Bearer token con ML_SERVICE_API_KEY (variable server-only,
 * nunca en el cliente ni en NEXT_PUBLIC_*).
 */
import { env } from "@/env";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
}

class MlGatewayError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "MlGatewayError";
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${env.ML_SERVICE_URL}${path}`;
  const { method = "GET", body } = options;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.ML_SERVICE_API_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
    // Sin caché — siempre queremos datos frescos del ml-service
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new MlGatewayError(res.status, `ML Service error (${res.status}): ${detail}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Tipado de respuestas del ml-service (espejo de los Pydantic models de FastAPI)
// ---------------------------------------------------------------------------

export interface AssetResponse {
  id: string;
  ticker: string;
  name: string | null;
  assetType: string | null;
  exchange: string | null;
  currency: string | null;
}

export interface OptimizeResponse {
  optimizationRunId: string;
  algorithm: string;
  objective: string;
  /** "historical" | "lstm:<versión>" | "blend:<versión>" */
  muSource: string;
  weights: { ticker: string; weight: number }[];
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio: number;
  convergenceHistory: number[];
}

export interface BacktestResponse {
  backtestId: string;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  cumulativeReturn: number;
  equityCurve: { date: string; portfolioValue: number }[];
  /** Benchmark evaluado sobre el mismo periodo fuera de muestra. */
  benchmark: {
    name: string;
    sharpe: number;
    sortino: number;
    maxDrawdown: number;
    cumulativeReturn: number;
    equityCurve: { date: string; portfolioValue: number }[];
  };
  /** Pesos y fechas de cada ventana del walk-forward. */
  windows: { trainStart: string; testStart: string; testEnd: string; weights: Record<string, number> }[];
}

export interface PredictResponse {
  ticker: string;
  modelVersion: string;
  predictionDate: string;
  horizonDays: number;
  predictedReturn: number;
  predictedRisk: number;
}

// ---------------------------------------------------------------------------
// Funciones públicas del gateway
// ---------------------------------------------------------------------------

export const mlGateway = {
  /** Registra un ticker nuevo y descarga su historial (RF-01). */
  fetchAsset: (ticker: string, forceFullHistory = false) =>
    request<AssetResponse>("/assets/fetch", {
      method: "POST",
      body: { ticker, force_full_history: forceFullHistory },
    }),

  /** Ejecuta el algoritmo de optimización (RF-04, RF-05). */
  optimize: (
    portfolioId: string,
    algorithm: "ga" | "pso" | "de",
    params?: Record<string, unknown>,
    options?: {
      objective?: "sharpe" | "min_variance" | "utility";
      muSource?: "historical" | "lstm" | "blend";
    },
  ) =>
    request<OptimizeResponse>("/optimize", {
      method: "POST",
      body: {
        portfolio_id: portfolioId,
        algorithm,
        params: params ?? {},
        objective: options?.objective ?? "sharpe",
        mu_source: options?.muSource ?? "historical",
      },
    }),

  /** Ejecuta Walk-Forward backtesting (RF-07, RF-08). */
  backtest: (
    optimizationRunId: string,
    benchmark = "equal_weight",
    startDate?: string,
    endDate?: string,
  ) =>
    request<BacktestResponse>("/backtest", {
      method: "POST",
      body: {
        optimization_run_id: optimizationRunId,
        benchmark,
        start_date: startDate,
        end_date: endDate,
      },
    }),

  /** Predicción LSTM para un activo (RF-03). */
  predict: (ticker: string, horizonDays = 21) =>
    request<PredictResponse>("/predict", {
      method: "POST",
      body: { ticker, horizon_days: horizonDays },
    }),
};
