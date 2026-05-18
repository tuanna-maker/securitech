import { authenticate, type AuthContext } from "../_shared/auth.ts";
import { parsePagination, paginatedResponse } from "../_shared/pagination.ts";
import { validate } from "../_shared/validation.ts";
import { writeAuditLog, emitEvent } from "../_shared/audit.ts";
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

    // ── POST — Trigger SOS ──
    if (method === "POST") {
      const body = await req.json();
      const v = validate(body)
        .required("building_id")
        .uuid("building_id")
        .string("caller_name", { max: 100 })
        .string("caller_phone", { max: 20 })
        .string("location_description", { max: 500 })
        .number("lat", { min: -90, max: 90 })
        .number("lng", { min: -180, max: 180 });

      if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

      const { data: sos, error } = await ctx.supabase
        .from("sos_calls")
        .insert({
          tenant_id: ctx.tenantId,
          building_id: body.building_id,
          resident_id: body.resident_id || null,
          caller_name: body.caller_name || "Unknown",
          caller_phone: body.caller_phone || null,
          location_description: body.location_description || null,
          lat: body.lat || null,
          lng: body.lng || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-dispatch nearest on-patrol guard
      const { data: guards } = await ctx.supabase
        .from("staff_members")
        .select("id, name")
        .eq("tenant_id", ctx.tenantId)
        .eq("building_id", body.building_id)
        .eq("status", "on-patrol")
        .limit(1);

      if (guards && guards.length > 0) {
        await ctx.supabase
          .from("sos_calls")
          .update({
            dispatched_guard_id: guards[0].id,
            status: "dispatched",
          })
          .eq("id", sos.id);
        sos.dispatched_guard_id = guards[0].id;
        sos.status = "dispatched";
      }

      // Emit realtime event
      await emitEvent(ctx, "sos_triggered", {
        sos_id: sos.id,
        building_id: body.building_id,
        caller_name: sos.caller_name,
        resident_id: body.resident_id,
        lat: body.lat,
        lng: body.lng,
      });

      // Create critical alert
      await ctx.supabase.from("alerts").insert({
        tenant_id: ctx.tenantId,
        building_id: body.building_id,
        type: "critical",
        description: `🚨 SOS từ ${sos.caller_name} - ${body.location_description || "Không rõ vị trí"}`,
      });

      await writeAuditLog(ctx, "create", "sos_call", sos.id, null, sos);
      return success(sos, 201);
    }

    // ── PATCH — Update SOS ──
    if (method === "PATCH") {
      const id = url.searchParams.get("id");
      if (!id) return badRequest("id required");

      const body = await req.json();
      const updates: Record<string, unknown> = {};
      if (body.status) updates.status = body.status;
      if (body.dispatched_guard_id) updates.dispatched_guard_id = body.dispatched_guard_id;
      if (body.notes) updates.notes = body.notes;
      if (body.status === "resolved") {
        updates.resolved_at = new Date().toISOString();
        const { data: original } = await ctx.supabase
          .from("sos_calls")
          .select("created_at")
          .eq("id", id)
          .single();
        if (original) {
          updates.response_time_seconds = Math.round(
            (Date.now() - new Date(original.created_at).getTime()) / 1000
          );
        }
      }

      const { data, error } = await ctx.supabase
        .from("sos_calls")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .select()
        .single();

      if (error) throw error;

      if (body.status === "dispatched" && body.dispatched_guard_id) {
        await emitEvent(ctx, "sos_responded", {
          sos_id: id,
          guard_id: body.dispatched_guard_id,
          response_time_seconds: data.response_time_seconds,
        });
      }

      return success(data);
    }

    // ── GET — List SOS ──
    if (method === "GET") {
      const { page, limit, offset } = parsePagination(url);
      const status = url.searchParams.get("status");
      const buildingId = url.searchParams.get("building_id");

      let query = ctx.supabase
        .from("sos_calls")
        .select("*, buildings(name), staff_members(name), residents(full_name, apartment)", { count: "exact" })
        .eq("tenant_id", ctx.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq("status", status);
      if (buildingId) query = query.eq("building_id", buildingId);

      const { data, count, error } = await query;
      if (error) throw error;
      return success(paginatedResponse(data || [], count, page, limit));
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
