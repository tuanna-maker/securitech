import type { AuthContext } from "./auth.ts";
import { corsHeaders } from "./cors.ts";

/**
 * Check if user has ANY of the specified roles.
 */
export function hasAnyRole(ctx: AuthContext, ...roles: string[]): boolean {
  return ctx.roles.some((r) => roles.includes(r));
}

/**
 * Require at least one of the specified roles. Returns error Response if denied.
 */
export function requireRole(
  ctx: AuthContext,
  ...roles: string[]
): Response | null {
  if (hasAnyRole(ctx, ...roles)) return null;
  return new Response(
    JSON.stringify({
      error: "Forbidden",
      required_roles: roles,
      your_roles: ctx.roles,
    }),
    {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
