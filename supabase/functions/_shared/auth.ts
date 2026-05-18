import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

export interface AuthContext {
  user: { id: string; email: string };
  tenantId: string;
  supabase: ReturnType<typeof createClient>;
  roles: string[];
}

/**
 * Authenticate request, resolve tenant, and load user roles.
 * Returns AuthContext or a Response (error).
 */
export async function authenticate(
  req: Request
): Promise<AuthContext | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonError("Unauthorized", 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
    error: authError,
  } = await userClient.auth.getUser();
  if (authError || !user) {
    return jsonError("Invalid token", 401);
  }

  // Get tenant
  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return jsonError("No tenant associated with user", 403);
  }

  // Get roles
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("tenant_id", profile.tenant_id);

  const roles = (roleRows || []).map((r: { role: string }) => r.role);

  return {
    user: { id: user.id, email: user.email || "" },
    tenantId: profile.tenant_id,
    supabase,
    roles,
  };
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
