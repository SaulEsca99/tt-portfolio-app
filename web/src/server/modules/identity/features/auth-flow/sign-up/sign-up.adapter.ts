import type { MiddlewareContext, MiddlewareOptions } from "better-auth";
import { APIError } from "better-auth/api";
import { ZodError } from "zod";

import { DomainError } from "@/server/shared/errors";

import { signUpDtoSchema } from "./sign-up.dto";
import { executeSignUp } from "./sign-up.use-case";

export async function betterAuthSignUpAdapter(
  ctx: MiddlewareContext<MiddlewareOptions>
) {
  try {
    const validatedData = signUpDtoSchema.parse(ctx.body);

    await executeSignUp(validatedData);

    return {
      context: {
        ...ctx,
        body: {
          ...validatedData,
        },
      },
    };
  } catch (error) {
    if (error instanceof DomainError) {
      throw new APIError("BAD_REQUEST", {
        message: error.message,
      });
    }

    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      throw new APIError("BAD_REQUEST", {
        message: firstError?.message || "Validation failed",
      });
    }

    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: "An unexpected error occurred during sign up",
    });
  }
}
