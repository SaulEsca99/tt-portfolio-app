"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { optimizationService } from "../services/optimization.service";

export const optimizationKeys = {
  run: (portfolioId: string) => ["optimization", portfolioId] as const,
  backtest: (runId: string) => ["backtest", runId] as const,
};

/** Lanza GA/PSO/DE y retorna los pesos óptimos. */
export function useRunOptimization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      portfolioId,
      algorithm,
      params,
    }: {
      portfolioId: string;
      algorithm: "ga" | "pso" | "de";
      params?: Record<string, unknown>;
    }) => optimizationService.run(portfolioId, algorithm, params),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: optimizationKeys.run(vars.portfolioId) });
    },
  });
}

/** Ejecuta Walk-Forward backtesting para un optimization_run dado. */
export function useRunBacktest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      optimizationRunId,
      benchmark,
      startDate,
      endDate,
    }: {
      optimizationRunId: string;
      benchmark?: string;
      startDate?: string;
      endDate?: string;
    }) => optimizationService.backtest(optimizationRunId, benchmark, startDate, endDate),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: optimizationKeys.backtest(vars.optimizationRunId) });
    },
  });
}
