import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Profile route ya no existe — redirige a account
export async function GET(_req: NextRequest) {
  return NextResponse.redirect(new URL("/settings/account", _req.url));
}
