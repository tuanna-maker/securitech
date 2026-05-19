import type { AuthContext } from "./auth.ts";
import { dispatchPushForEvent } from "./push.ts";

/**
 * Write an audit log entry.
 */
export async function writeAuditLog(
  ctx: AuthContext,
  action: string,
  entityType: string,
  entityId?: string,
  oldData?: unknown,
  newData?: unknown
) {
  await ctx.supabase.from("audit_logs").insert({
    tenant_id: ctx.tenantId,
    user_id: ctx.user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
    new_data: newData ? JSON.parse(JSON.stringify(newData)) : null,
  });
}

/**
 * Emit a system event for realtime processing.
 */
export async function emitEvent(
  ctx: AuthContext,
  eventType: string,
  payload: Record<string, unknown>
) {
  await dispatchPushForEvent(ctx.supabase, ctx.tenantId, eventType, payload);

  await ctx.supabase.from("system_events").insert({
    tenant_id: ctx.tenantId,
    event_type: eventType,
    payload,
    is_processed: true,
  });
}
