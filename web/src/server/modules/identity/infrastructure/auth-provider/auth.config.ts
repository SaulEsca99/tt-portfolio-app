import { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { env } from "@/env";
import { db } from "@/server/db";
import { betterAuthSignUpAdapter } from "../../features/auth-flow/sign-up/sign-up.adapter";
import * as authSchema from "../db/auth.schema";

export const authConfig = {
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,

  trustedOrigins: [
    "https://tt-portfolio-app-zeta.vercel.app",
    // Aceptar cualquier preview de Vercel de este proyecto
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_BRANCH_URL ? [`https://${process.env.VERCEL_BRANCH_URL}`] : []),
    // Desarrollo local
    "http://localhost:3000",
  ],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...authSchema },
  }),

  user: {
    additionalFields: {
      // Campos mínimos requeridos por la app de portafolios
      phone: { type: "string", input: true, required: false },
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    }
    : {},

  secret: env.BETTER_AUTH_SECRET,

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") return betterAuthSignUpAdapter(ctx);
    }),
  },
} satisfies BetterAuthOptions;
