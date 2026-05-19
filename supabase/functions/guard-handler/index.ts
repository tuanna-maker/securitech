import { authenticateGuard } from "../_shared/mobile-auth.ts";
import { emitEvent } from "../_shared/audit.ts";
import { corsResponse } from "../_shared/cors.ts";
import { badRequest, methodNotAllowed, serverError, success, notFound } from "../_shared/errors.ts";

const TRANSITIONS: Record<string, string[]> = {
  accepted: ["submitted", "escalated"],
  en_route: ["accepted"],
  on_site: ["en_route"],
  completed: ["on_site"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const result = await authenticateGuard(req);
    if (result instanceof Response) return result;
    const ctx = result;
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "GET" && action === "queue") {
      const buildingId = url.searchParams.get("building_id") || ctx.buildingId;
      if (!buildingId) return badRequest("building_id required");

      const { data: quick } = await ctx.supabase
        .from("quick_service_requests")
        .select("*, residents(full_name, apartment)")
        .eq("tenant_id", ctx.tenantId)
        .eq("building_id", buildingId)
        .in("app_status", ["submitted", "escalated", "accepted", "en_route", "on_site"])
        .order("created_at", { ascending: true });

      const { data: support } = await ctx.supabase
        .from("support_requests")
        .select("*, residents(full_name, apartment)")
        .eq("tenant_id", ctx.tenantId)
        .eq("building_id", buildingId)
        .in("app_status", ["submitted", "escalated", "accepted", "en_route", "on_site"])
        .order("created_at", { ascending: true });

      const items = [
        ...(quick || []).map((r) => ({ ...r, source: "quick" as const })),
        ...(support || []).map((r) => ({ ...r, source: "support" as const })),
      ].sort((a, b) => {
        const p = (x: { priority_tier?: string }) => (x.priority_tier === "critical" ? 3 : x.priority_tier === "high" ? 2 : 1);
        return p(b) - p(a) || new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

      return success({ success: true, data: { items } });
    }

    if (req.method === "POST" && action === "attendance") {
      const body = await req.json();
      const { data: features } = await ctx.supabase
        .from("building_features")
        .select("attendance_zones")
        .eq("building_id", body.building_id || ctx.buildingId)
        .maybeSingle();

      const zones = (features?.attendance_zones as { id: string; lat: number; lng: number; radius_m: number }[]) || [];
      const zone = zones.find((z) => z.id === body.zone_id) || zones[0];
      if (zone && body.lat != null && body.lng != null) {
        const { data: dist } = await ctx.supabase.rpc("haversine_m", {
          lat1: body.lat,
          lng1: body.lng,
          lat2: zone.lat,
          lng2: zone.lng,
        });
        if (typeof dist === "number" && dist > (zone.radius_m || 100)) {
          return new Response(
            JSON.stringify({ success: false, error: { code: "ERR-LOC-01", message: "Wrong check-in location" } }),
            { status: 422, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      const { data, error } = await ctx.supabase
        .from("guard_attendance")
        .insert({
          tenant_id: ctx.tenantId,
          staff_member_id: ctx.staffMemberId,
          building_id: body.building_id || ctx.buildingId,
          shift_schedule_id: body.shift_schedule_id || null,
          zone_id: body.zone_id || null,
          lat: body.lat,
          lng: body.lng,
        })
        .select()
        .single();

      if (error) throw error;

      await ctx.supabase
        .from("staff_members")
        .update({ last_check_in: new Date().toISOString(), status: "stationary" })
        .eq("id", ctx.staffMemberId);

      return success({ success: true, data }, 201);
    }

    if (req.method === "POST" && action === "accept") {
      const body = await req.json();
      const table = body.source === "support" ? "support_requests" : "quick_service_requests";
      const assignField = body.source === "support" ? "assignee_id" : "assigned_to";

      const { data: features } = await ctx.supabase
        .from("building_features")
        .select("max_concurrent_requests_per_guard")
        .eq("building_id", ctx.buildingId)
        .maybeSingle();
      const maxN = features?.max_concurrent_requests_per_guard ?? 1;

      const { count } = await ctx.supabase
        .from("quick_service_requests")
        .select("*", { count: "exact", head: true })
        .eq("assigned_to", ctx.staffMemberId)
        .in("app_status", ["accepted", "en_route", "on_site"]);

      if ((count || 0) >= maxN) {
        return new Response(
          JSON.stringify({ success: false, error: { code: "ERR-REQ-05", message: "Max concurrent requests reached" } }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await ctx.supabase
        .from(table)
        .update({ [assignField]: ctx.staffMemberId, app_status: "accepted" })
        .eq("id", body.request_id)
        .in("app_status", ["submitted", "escalated"])
        .is(assignField, null)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return new Response(
          JSON.stringify({ success: false, error: { code: "ERR-REQ-06", message: "Already assigned" } }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      await emitEvent(ctx, "life_request_accepted", { request_id: body.request_id, guard_id: ctx.staffMemberId });
      return success({ success: true, data });
    }

    if (req.method === "POST" && action === "decline") {
      const body = await req.json();
      if (body.priority_tier === "critical") {
        return new Response(
          JSON.stringify({ success: false, error: { code: "ERR-REQ-07", message: "Cannot decline critical request" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      await ctx.supabase.from("request_declines").insert({
        tenant_id: ctx.tenantId,
        request_type: body.source || "quick",
        request_id: body.request_id,
        staff_member_id: ctx.staffMemberId,
        reason: body.reason || "busy",
      });
      return success({ success: true });
    }

    if (req.method === "POST" && action === "transition") {
      const body = await req.json();
      const table = body.source === "support" ? "support_requests" : "quick_service_requests";
      const to = body.to_status as string;
      const allowedFrom = TRANSITIONS[to];
      if (!allowedFrom) return badRequest("Invalid to_status");

      const updates: Record<string, unknown> = { app_status: to };
      if (to === "completed") {
        updates.status = "resolved";
        updates.completed_at = new Date().toISOString();
        if (body.source === "support") updates.resolved_at = new Date().toISOString();
      }
      if (to === "en_route") updates.status = "in_progress";

      const { data, error } = await ctx.supabase
        .from(table)
        .update(updates)
        .eq("id", body.request_id)
        .in("app_status", allowedFrom)
        .select()
        .single();

      if (error) throw error;
      if (to === "completed") {
        await emitEvent(ctx, "life_request_completed", { request_id: body.request_id });
      } else if (["en_route", "on_site", "expired"].includes(to)) {
        await emitEvent(ctx, "life_request_status", {
          request_id: body.request_id,
          to_status: to,
          building_id: ctx.buildingId,
        });
      }
      return success({ success: true, data });
    }

    if (req.method === "POST" && action === "location-ping") {
      const body = await req.json();
      const { data, error } = await ctx.supabase
        .from("guard_location_pings")
        .insert({
          tenant_id: ctx.tenantId,
          staff_member_id: ctx.staffMemberId,
          request_id: body.request_id,
          request_type: body.request_type || "quick",
          lat: body.lat,
          lng: body.lng,
        })
        .select()
        .single();
      if (error) throw error;
      return success({ success: true, data }, 201);
    }

    if (req.method === "POST" && action === "checkin-visitor") {
      const body = await req.json();
      const token = String(body.qr_token || body.token || "").replace("STOS:", "");
      const { data: invite } = await ctx.supabase
        .from("visitor_invites")
        .select("*")
        .eq("qr_token", token)
        .eq("building_id", ctx.buildingId)
        .maybeSingle();

      if (!invite) return notFound("Invite");
      const now = new Date();
      if (new Date(invite.visit_end) < now) return badRequest("QR expired");

      const { data: log, error: logErr } = await ctx.supabase
        .from("access_logs")
        .insert({
          tenant_id: ctx.tenantId,
          building_id: invite.building_id,
          guard_id: ctx.staffMemberId,
          visitor_name: invite.visitor_name,
          visitor_type: "guest",
          host_resident: invite.resident_id,
          vehicle_plate: invite.vehicle_plate,
        })
        .select()
        .single();
      if (logErr) throw logErr;

      await ctx.supabase
        .from("visitor_invites")
        .update({ status: "checked_in", access_log_id: log.id })
        .eq("id", invite.id);

      await emitEvent(ctx, "guest_checked_in", { invite_id: invite.id, resident_id: invite.resident_id });
      return success({ success: true, data: log });
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
