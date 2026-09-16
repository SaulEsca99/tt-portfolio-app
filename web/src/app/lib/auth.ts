import { headers } from "next/headers";
import { cache } from "react";

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { authConfig } from "@/server/modules/identity/infrastructure/auth-provider/auth.config";

export const auth = betterAuth({
  ...authConfig,
  plugins: [...authConfig.plugins, nextCookies()],
});

export const getSession = cache(async () =>
  auth.api.getSession({
    headers: await headers(),
  })
);

export type Session = typeof auth.$Infer.Session;
