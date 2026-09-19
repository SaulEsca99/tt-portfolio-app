// API route: GET /api/portfolios/[portfolioId]
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";
import { db } from "@/server/db";
import {
  portfolioTable,
  portfolioCandidateTable,
  assetTable,
} from "@/server/db/domain.schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { portfolioId } = await params;

  const [portfolio] = await db
    .select()
    .from(portfolioTable)
    .where(
      and(eq(portfolioTable.id, portfolioId), eq(portfolioTable.userId, session.user.id)),
    );

  if (!portfolio) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const candidates = await db
    .select({ candidate: portfolioCandidateTable, asset: assetTable })
    .from(portfolioCandidateTable)
    .leftJoin(assetTable, eq(portfolioCandidateTable.assetId, assetTable.id))
    .where(eq(portfolioCandidateTable.portfolioId, portfolioId));

  return NextResponse.json({ ...portfolio, candidates });
}
