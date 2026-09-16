// Tipos del dominio compartidos entre módulos del cliente.
// No importes nada de server/ ni de next/ aquí.

export type Algorithm = "ga" | "pso" | "de";

export interface Asset {
  id: string;
  ticker: string;
  name: string | null;
  assetType: string | null;
  exchange: string | null;
  currency: string | null;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  capital: string | null;
  riskAversionLambda: string | null;
  maxAssets: number | null;
  createdAt: string;
}

export interface PortfolioCandidate {
  id: string;
  portfolioId: string;
  assetId: string;
  minWeight: string | null;
  maxWeight: string | null;
  asset?: Asset;
}

export interface OptimizationRun {
  id: string;
  portfolioId: string;
  algorithm: Algorithm;
  status: "pending" | "running" | "done" | "error";
  params: Record<string, unknown> | null;
  requestedAt: string;
  completedAt: string | null;
}

export interface WeightResult {
  ticker: string;
  weight: number;
}

export interface OptimizationResult {
  optimizationRunId: string;
  algorithm: Algorithm;
  weights: WeightResult[];
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio: number;
}

export interface EquityPoint {
  date: string;
  portfolioValue: number;
}

export interface BacktestResult {
  backtestId: string;
  sharpe: number;
  sortino: number;
  maxDrawdown: number;
  cumulativeReturn: number;
  equityCurve: EquityPoint[];
}

export interface LstmPrediction {
  ticker: string;
  modelVersion: string;
  predictionDate: string;
  horizonDays: number;
  predictedReturn: number;
  predictedRisk: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
