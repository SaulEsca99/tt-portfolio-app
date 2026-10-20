// API route: POST /api/backtest

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { mlGateway } from "@/server/modules/ml-gateway/ml-gateway.client";
import { db } from "@/server/db";
import { optimizationRunTable, portfolioTable } from "@/server/db/domain.schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const BacktestSchema = z.object({
  optimizationRunId: z.string().uuid(),
  benchmark: z.string().default("equal_weight"),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  costBps: z.number().min(0).max(100).default(0),
});

// El walk-forward re-optimiza en cada ventana; Vercel corta a los 10 s por defecto en Hobby.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = BacktestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Verificar que la corrida pertenece a una cartera del usuario autenticado
  const [owned] = await db
    .select({ id: optimizationRunTable.id })
    .from(optimizationRunTable)
    .innerJoin(portfolioTable, eq(optimizationRunTable.portfolioId, portfolioTable.id))
    .where(
      and(
        eq(optimizationRunTable.id, parsed.data.optimizationRunId),
        eq(portfolioTable.userId, session.user.id),
      ),
    );
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const result = await mlGateway.backtest(
      parsed.data.optimizationRunId,
      parsed.data.benchmark,
      parsed.data.startDate,
      parsed.data.endDate,
      parsed.data.costBps,
    );
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/backtest]", err);
    return NextResponse.json({ error: "Backtesting service unavailable." }, { status: 502 });
  }
}
