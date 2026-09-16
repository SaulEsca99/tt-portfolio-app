// API route: POST /api/backtest

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/modules/identity/infrastructure/auth-provider/auth.config";
import { mlGateway } from "@/server/modules/ml-gateway/ml-gateway.client";
import { z } from "zod";

const BacktestSchema = z.object({
  optimizationRunId: z.string().uuid(),
  benchmark: z.string().default("equal_weight"),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

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

  try {
    const result = await mlGateway.backtest(
      parsed.data.optimizationRunId,
      parsed.data.benchmark,
      parsed.data.startDate,
      parsed.data.endDate,
    );
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[/api/backtest]", err);
    return NextResponse.json({ error: "Backtesting service unavailable." }, { status: 502 });
  }
}
