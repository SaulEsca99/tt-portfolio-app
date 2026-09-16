import { BetterAuthOptions } from "better-auth";
import { admin } from "better-auth/plugins";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";

import { env } from "@/env";
import { db } from "@/server/db";

import { betterAuthSignUpAdapter } from "../../features/auth-flow/sign-up/sign-up.adapter";

import * as authSchema from "../db/auth.schema";

import { adminOptions } from "./admin.plugin";

export const authConfig = {
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...authSchema },
  }),

  user: {
    additionalFields: {
      onboardingCompleted: {
        type: "boolean",
        input: false,
        defaultValue: false,
      },

      role: { type: "string", input: false },
      isDonor: { type: "boolean", input: false, defaultValue: false },
      isBeneficiary: { type: "boolean", input: false, defaultValue: false },

      phone: { type: "string", input: true, required: false },
      birthDate: { type: "date", input: true, required: false },
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

  plugins: [admin(adminOptions)],
} satisfies BetterAuthOptions;
