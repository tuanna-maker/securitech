import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { dispatchPushForEvent } from "../_shared/push.ts";
import { corsResponse } from "../_shared/cors.ts";
import { badRequest, methodNotAllowed, serverError, success } from "../_shared/errors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    if (req.method === "POST") {
      const body = await req.json();
      const eventType = String(body.event_type || "");
      const tenantId = String(body.tenant_id || "");
      const payload = (body.payload || {}) as Record<string, unknown>;
      if (!eventType || !tenantId) return badRequest("event_type and tenant_id required");

      await dispatchPushForEvent(supabase, tenantId, eventType, payload);
      return success({ success: true, dispatched: true });
    }

    if (req.method === "GET") {
      const limit = Math.min(Number(new URL(req.url).searchParams.get("limit") || "20"), 50);
      const { data: events, error } = await supabase
        .from("system_events")
        .select("id, tenant_id, event_type, payload")
        .eq("is_processed", false)
        .order("created_at", { ascending: true })
        .limit(limit);

      if (error) throw error;

      for (const ev of events || []) {
        await dispatchPushForEvent(supabase, ev.tenant_id, ev.event_type, ev.payload as Record<string, unknown>);
        await supabase.from("system_events").update({ is_processed: true }).eq("id", ev.id);
      }

      return success({ success: true, processed: (events || []).length });
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
