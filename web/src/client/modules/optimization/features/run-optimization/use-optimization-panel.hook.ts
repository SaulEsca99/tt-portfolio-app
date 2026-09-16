"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRunOptimization, useRunBacktest } from "../hooks/use-optimization.hook";
import type { Algorithm, OptimizationResult, BacktestResult } from "@/client/types/domain.types";

/** Estado y lógica del panel de optimización completo (RF-04, RF-05, RF-07, RF-08). */
export function useOptimizationPanel(portfolioId: string) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>("ga");
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  const { mutateAsync: runOpt, isPending: isOptimizing } = useRunOptimization();
  const { mutateAsync: runBt, isPending: isBacktesting } = useRunBacktest();

  async function handleOptimize() {
    try {
      toast.info(`Ejecutando ${selectedAlgorithm.toUpperCase()}…`);
      const result = await runOpt({ portfolioId, algorithm: selectedAlgorithm });
      setOptimizationResult(result);
      setBacktestResult(null); // reset backtest al re-optimizar
      toast.success("Optimización completada.");
    } catch {
      toast.error("Error al optimizar. El servicio puede estar iniciando (cold start). Reintenta en 30 s.");
    }
  }

  async function handleBacktest(benchmark = "equal_weight") {
    if (!optimizationResult) return;
    try {
      toast.info("Ejecutando Walk-Forward Analysis…");
      const result = await runBt({
        optimizationRunId: optimizationResult.optimizationRunId,
        benchmark,
      });
      setBacktestResult(result);
      toast.success("Backtesting completado.");
    } catch {
      toast.error("Error al ejecutar el backtesting.");
    }
  }

  return {
    selectedAlgorithm,
    setSelectedAlgorithm,
    optimizationResult,
    backtestResult,
    isOptimizing,
    isBacktesting,
    handleOptimize,
    handleBacktest,
  };
}
