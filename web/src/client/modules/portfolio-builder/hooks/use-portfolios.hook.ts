"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { portfolioService } from "../services/portfolio.service";
import type { Portfolio } from "@/client/types/domain.types";

export const portfolioKeys = {
  all: ["portfolios"] as const,
  detail: (id: string) => ["portfolios", id] as const,
};

/** Lista todos los portafolios del usuario. */
export function usePortfolios() {
  return useQuery({
    queryKey: portfolioKeys.all,
    queryFn: () => portfolioService.list(),
  });
}

/** Portafolio individual con sus candidatos. */
export function usePortfolio(portfolioId: string) {
  return useQuery({
    queryKey: portfolioKeys.detail(portfolioId),
    queryFn: () => portfolioService.getById(portfolioId),
    enabled: !!portfolioId,
  });
}

/** Crea un nuevo portafolio. */
export function useCreatePortfolio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof portfolioService.create>[0]) =>
      portfolioService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
}

/** Agrega un activo candidato al portafolio. */
export function useAddCandidate(portfolioId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { ticker: string; minWeight?: number; maxWeight?: number }) =>
      portfolioService.addCandidate(portfolioId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: portfolioKeys.detail(portfolioId) });
    },
  });
}
