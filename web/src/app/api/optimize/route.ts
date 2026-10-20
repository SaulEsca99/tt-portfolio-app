// API route: POST /api/optimize
// Llama al ml-service vía ml-gateway. NUNCA expone ML_SERVICE_API_KEY al cliente.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { mlGateway } from "@/server/modules/ml-gateway/ml-gateway.client";
import { db } from "@/server/db";
import { portfolioTable } from "@/server/db/domain.schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const OptimizeSchema = z.object({
  portfolioId: z.string().uuid(),
  algorithm: z.enum(["ga", "pso", "de"]).default("ga"),
  params: z.record(z.string(), z.unknown()).optional(),
  objective: z.enum(["sharpe", "min_variance", "utility"]).default("sharpe"),
  muSource: z.enum(["historical", "lstm", "blend"]).default("historical"),
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // 1. Verificar sesión activa
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validar el cuerpo de la petición
  const body = await req.json().catch(() => null);
  const parsed = OptimizeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // 3. Verificar que la cartera pertenece al usuario autenticado
  const [owned] = await db
    .select({ id: portfolioTable.id })
    .from(portfolioTable)
    .where(
      and(
        eq(portfolioTable.id, parsed.data.portfolioId),
        eq(portfolioTable.userId, session.user.id),
      ),
    );
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 4. Llamar al ml-service (server-only)
  try {
    const result = await mlGateway.optimize(
      parsed.data.portfolioId,
      parsed.data.algorithm,
      parsed.data.params,
      { objective: parsed.data.objective, muSource: parsed.data.muSource },
    );
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/optimize]", err);
    const status = err instanceof Error && "status" in err ? (err as { status: number }).status : 502;
    return NextResponse.json({ error: "Optimization service unavailable." }, { status });
  }
}
