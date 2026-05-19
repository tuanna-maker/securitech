import { authenticate, type AuthContext } from "./auth.ts";
import { corsHeaders } from "./cors.ts";

export interface ResidentContext extends AuthContext {
  residentId: string;
  buildingId: string;
}

export interface GuardContext extends AuthContext {
  staffMemberId: string;
  buildingId: string | null;
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ success: false, error: { code: "ERR_AUTH", message } }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function authenticateResident(req: Request): Promise<ResidentContext | Response> {
  const result = await authenticate(req);
  if (result instanceof Response) return result;
  const ctx = result as AuthContext;

  if (!ctx.roles.includes("resident")) {
    return jsonError("Resident role required", 403);
  }

  const { data: resident } = await ctx.supabase
    .from("residents")
    .select("id, building_id")
    .eq("user_id", ctx.user.id)
    .eq("tenant_id", ctx.tenantId)
    .eq("status", "active")
    .maybeSingle();

  if (!resident) return jsonError("No active resident profile", 403);

  return { ...ctx, residentId: resident.id, buildingId: resident.building_id };
}

export async function authenticateGuard(req: Request): Promise<GuardContext | Response> {
  const result = await authenticate(req);
  if (result instanceof Response) return result;
  const ctx = result as AuthContext;

  if (!ctx.roles.includes("guard")) {
    return jsonError("Guard role required", 403);
  }

  const { data: staff } = await ctx.supabase
    .from("staff_members")
    .select("id, building_id")
    .eq("user_id", ctx.user.id)
    .eq("tenant_id", ctx.tenantId)
    .maybeSingle();

  if (!staff) return jsonError("No staff profile", 403);

  return { ...ctx, staffMemberId: staff.id, buildingId: staff.building_id };
}
