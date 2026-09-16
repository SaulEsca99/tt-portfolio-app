// API route: POST /api/portfolios  (listar y crear)
// La lectura/escritura de portafolios es exclusiva de Next.js (dueño de la tabla).

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/modules/identity/infrastructure/auth-provider/auth.config";
import { db } from "@/server/db";
import { portfolioTable } from "@/server/db/domain.schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const CreatePortfolioSchema = z.object({
  name: z.string().min(1).max(255),
  capital: z.number().positive().optional(),
  riskAversionLambda: z.number().min(0).max(10).optional(),
  maxAssets: z.number().int().positive().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const portfolios = await db
    .select()
    .from(portfolioTable)
    .where(eq(portfolioTable.userId, session.user.id));

  return NextResponse.json(portfolios);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreatePortfolioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [portfolio] = await db
    .insert(portfolioTable)
    .values({
      userId: session.user.id,
      name: parsed.data.name,
      capital: parsed.data.capital?.toString(),
      riskAversionLambda: parsed.data.riskAversionLambda?.toString(),
      maxAssets: parsed.data.maxAssets,
    })
    .returning();

  return NextResponse.json(portfolio, { status: 201 });
}
