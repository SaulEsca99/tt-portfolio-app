import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import type { UserRole } from "@client/types/user";

import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/client/config/routes";

import { auth } from "@/app/lib/auth";

/**
 * Configuration options for authentication guards
 *
 * @property requiredRoles - Array of roles that have access. If empty/undefined, any authenticated user can access
 * @property requireAuth - Whether authentication is required (default: true)
 * @property requireGuest - Whether only unauthenticated users can access (default: false)
 * @property onFail - Action to take when authorization fails: "notFound" returns 404, "redirect" redirects to specified route
 * @property redirectTo - Custom redirect path when authorization fails (defaults to "/sign-in")
 */
type GuardConfig = {
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
  requireGuest?: boolean;
  onFail?: "notFound" | "redirect";
  redirectTo?: string;
};

/**
 * Creates a cached authentication guard with customizable authorization logic
 *
 * Guards can enforce:
 * - Authentication requirement
 * - Guest-only access
 * - Role-based access control
 *
 * @param config - Guard configuration options
 * @returns Object containing session, user, and authorization status
 *
 * @example
 * // In a server component
 * const { user } = await createAuthGuard({ requiredRoles: ["admin"] });
 */
export const createAuthGuard = cache(async (config: GuardConfig = {}) => {
  const {
    requiredRoles,
    requireAuth = true,
    requireGuest = false,
    onFail = "redirect",
    redirectTo,
  } = config;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Guest-only routes: redirect authenticated users
  if (requireGuest && session) redirect(PUBLIC_ROUTES.home);

  // Protected routes: handle unauthenticated users
  if (requireAuth && !requireGuest && !session) {
    if (onFail === "redirect") redirect(redirectTo ?? AUTH_ROUTES.signIn);

    notFound();
  }

  // Role-based access control
  if (requiredRoles && requiredRoles.length > 0 && session) {
    const userRole = session.user.role as UserRole;
    const hasRequiredRole = requiredRoles.includes(userRole);

    if (!hasRequiredRole) {
      notFound();
    }
  }

  return { session, user: session?.user, isAuthorized: true };
});

// ============================================================================
// Convenience Guards - Common authentication patterns
// ============================================================================

/**
 * Standard authentication guard - requires any authenticated user
 * Redirects to sign-in if not authenticated
 */
export const guardAuth = () => createAuthGuard({ requireAuth: true });

/**
 * Admin-only guard - requires authenticated user with "admin" role
 * Returns 404 if user lacks admin privileges
 */
export const guardAdmin = () => createAuthGuard({ requiredRoles: ["admin"] });

/**
 * Guest-only guard - requires unauthenticated user
 * Redirects to home if already authenticated (useful for login/register pages)
 */
export const guardGuest = () =>
  createAuthGuard({ requireGuest: true, requireAuth: false });
