import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { env } from "@/env";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const start = performance.now();

    await db.execute(sql`SELECT 1`);

    const end = performance.now();
    const latency = Math.round(end - start);

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        latency: `${latency}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health Check Failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
