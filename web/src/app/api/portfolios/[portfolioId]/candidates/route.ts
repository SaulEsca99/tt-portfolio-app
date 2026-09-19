// API route: POST /api/portfolios/[portfolioId]/candidates
// Agrega un activo candidato a un portafolio.
// Primero verifica que el activo exista en la BD; si no, llama al ml-service para descargarlo.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { db } from "@/server/db";
import {
  portfolioTable,
  portfolioCandidateTable,
  assetTable,
} from "@/server/db/domain.schema";
import { eq, and } from "drizzle-orm";
import { mlGateway } from "@/server/modules/ml-gateway/ml-gateway.client";
import { z } from "zod";

const Schema = z.object({
  ticker: z.string().min(1).max(20).toUpperCase(),
  minWeight: z.number().min(0).max(1).optional(),
  maxWeight: z.number().min(0).max(1).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { portfolioId } = await params;

  // Verificar que el portafolio pertenece al usuario
  const [portfolio] = await db
    .select()
    .from(portfolioTable)
    .where(
      and(eq(portfolioTable.id, portfolioId), eq(portfolioTable.userId, session.user.id)),
    );
  if (!portfolio) return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { ticker, minWeight, maxWeight } = parsed.data;

  // Buscar si el activo ya existe en la BD
  const [existing] = await db.select().from(assetTable).where(eq(assetTable.ticker, ticker));

  let assetId: string;

  if (existing) {
    assetId = existing.id;
  } else {
    // On-demand fetch: el ml-service descarga el historial y registra el activo
    try {
      const asset = await mlGateway.fetchAsset(ticker);
      assetId = asset.id;
    } catch {
      return NextResponse.json(
        { error: `No se encontró el ticker '${ticker}' en ninguna fuente de datos.` },
        { status: 404 },
      );
    }
  }

  // Insertar candidato
  const [candidate] = await db
    .insert(portfolioCandidateTable)
    .values({
      portfolioId,
      assetId,
      minWeight: minWeight?.toString(),
      maxWeight: maxWeight?.toString(),
    })
    .returning();

  return NextResponse.json({ ...candidate, ticker }, { status: 201 });
}
