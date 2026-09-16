import type { Algorithm, OptimizationResult, BacktestResult } from "@/client/types/domain.types";

export const optimizationService = {
  /** Lanza la optimización y espera el resultado (RF-04, RF-05). */
  run: async (
    portfolioId: string,
    algorithm: Algorithm = "ga",
    params?: Record<string, unknown>,
  ): Promise<OptimizationResult> => {
    const res = await fetch("/api/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolioId, algorithm, params }),
    });
    if (!res.ok) throw new Error("Error al optimizar portafolio.");
    return res.json();
  },

  /** Ejecuta el backtesting Walk-Forward (RF-07, RF-08). */
  backtest: async (
    optimizationRunId: string,
    benchmark = "equal_weight",
    startDate?: string,
    endDate?: string,
  ): Promise<BacktestResult> => {
    const res = await fetch("/api/backtest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optimizationRunId, benchmark, startDate, endDate }),
    });
    if (!res.ok) throw new Error("Error al ejecutar backtesting.");
    return res.json();
  },
};
