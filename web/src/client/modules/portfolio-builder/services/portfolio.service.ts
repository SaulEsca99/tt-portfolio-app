// Servicio HTTP del lado del cliente — llama a las API routes de Next.js.
// NUNCA llama directamente al ml-service (la key nunca llega al browser).

import type { Portfolio, PortfolioCandidate } from "@/client/types/domain.types";

const BASE = "/api/portfolios";

export const portfolioService = {
  /** Lista todos los portafolios del usuario autenticado. */
  list: async (): Promise<Portfolio[]> => {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error("Error al cargar portafolios.");
    return res.json();
  },

  /** Crea un nuevo portafolio. */
  create: async (data: {
    name: string;
    capital?: number;
    riskAversionLambda?: number;
    maxAssets?: number;
  }): Promise<Portfolio> => {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear portafolio.");
    return res.json();
  },

  /** Agrega un activo candidato al portafolio. */
  addCandidate: async (
    portfolioId: string,
    data: { ticker: string; minWeight?: number; maxWeight?: number },
  ): Promise<PortfolioCandidate> => {
    const res = await fetch(`${BASE}/${portfolioId}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al agregar activo.");
    return res.json();
  },

  /** Obtiene un portafolio con sus candidatos. */
  getById: async (portfolioId: string): Promise<Portfolio & { candidates: PortfolioCandidate[] }> => {
    const res = await fetch(`${BASE}/${portfolioId}`);
    if (!res.ok) throw new Error("Portafolio no encontrado.");
    return res.json();
  },
};
