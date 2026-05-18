import { authenticate, type AuthContext } from "../_shared/auth.ts";
import { parsePagination, paginatedResponse } from "../_shared/pagination.ts";
import { writeAuditLog } from "../_shared/audit.ts";
import { corsResponse } from "../_shared/cors.ts";
import { badRequest, methodNotAllowed, serverError, success } from "../_shared/errors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const result = await authenticate(req);
    if (result instanceof Response) return result;
    const ctx = result as AuthContext;
    const url = new URL(req.url);
    const method = req.method;

    if (method !== "GET") return methodNotAllowed();

    const action = url.searchParams.get("action");

    // ── PROFILE ──
    if (!action || action === "profile") {
      const { data, error } = await ctx.supabase
        .from("profiles")
        .select("*")
        .eq("user_id", ctx.user.id)
        .eq("tenant_id", ctx.tenantId)
        .single();

      if (error) throw error;

      return success({
        ...data,
        roles: ctx.roles,
        email: ctx.user.email,
      });
    }

    // ── ROLES ──
    if (action === "roles") {
      const { data, error } = await ctx.supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", ctx.user.id)
        .eq("tenant_id", ctx.tenantId);

      if (error) throw error;
      return success(data);
    }

    // ── TENANT INFO ──
    if (action === "tenant") {
      const { data, error } = await ctx.supabase
        .from("tenants")
        .select("id, company_name, domain, plan, is_active")
        .eq("id", ctx.tenantId)
        .single();

      if (error) throw error;
      return success(data);
    }

    // ── ALL USERS IN TENANT (admin only) ──
    if (action === "users") {
      const { page, limit, offset } = parsePagination(url);

      const { data, count, error } = await ctx.supabase
        .from("profiles")
        .select("*, user_roles(role)", { count: "exact" })
        .eq("tenant_id", ctx.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return success(paginatedResponse(data || [], count, page, limit));
    }

    return badRequest("Unknown action");
  } catch (err) {
    return serverError(err);
  }
});
