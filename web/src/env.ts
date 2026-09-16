import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    DATABASE_URL: z.url(),

    DB_MIGRATING: z
      .string()
      .optional()
      .transform((s) => s !== "false" && s !== "0"),

    DB_SEEDING: z
      .string()
      .optional()
      .transform((s) => s !== "false" && s !== "0"),

    BETTER_AUTH_SECRET: z.string().optional(),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // -------------------------------------------------------------------------
    // ml-service — NUNCA en el cliente (no usar NEXT_PUBLIC_*)
    // -------------------------------------------------------------------------
    /** URL base del servicio FastAPI (ej. https://tt-portfolio-ml.onrender.com) */
    ML_SERVICE_URL: z.url(),
    /** API key interna compartida con el ml-service (Bearer token) */
    ML_SERVICE_API_KEY: z.string().min(32),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,

    DATABASE_URL: process.env.DATABASE_URL,
    DB_MIGRATING: process.env.DB_MIGRATING,
    DB_SEEDING: process.env.DB_SEEDING,

    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    ML_SERVICE_URL: process.env.ML_SERVICE_URL,
    ML_SERVICE_API_KEY: process.env.ML_SERVICE_API_KEY,

    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
