import { authenticate, type AuthContext } from "../_shared/auth.ts";
import { parsePagination, paginatedResponse } from "../_shared/pagination.ts";
import { validate } from "../_shared/validation.ts";
import { writeAuditLog, emitEvent } from "../_shared/audit.ts";
import { corsResponse } from "../_shared/cors.ts";
import { badRequest, methodNotAllowed, serverError, success, notFound } from "../_shared/errors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const result = await authenticate(req);
    if (result instanceof Response) return result;
    const ctx = result as AuthContext;
    const url = new URL(req.url);
    const method = req.method;
    const action = url.searchParams.get("action");

    // ── PARCEL MANAGEMENT ──
    if (action === "parcels") {
      if (method === "GET") {
        const { page, limit, offset } = parsePagination(url);
        const buildingId = url.searchParams.get("building_id");
        const status = url.searchParams.get("status");

        let query = ctx.supabase
          .from("parcels")
          .select("*, buildings(name), residents(full_name, apartment)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("received_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (buildingId) query = query.eq("building_id", buildingId);
        if (status) query = query.eq("status", status);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        const body = await req.json();
        const v = validate(body)
          .required("building_id")
          .uuid("building_id")
          .uuid("resident_id")
          .string("tracking_number", { max: 100 })
          .string("sender", { max: 200 });

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("parcels")
          .insert({
            tenant_id: ctx.tenantId,
            building_id: body.building_id,
            resident_id: body.resident_id || null,
            tracking_number: body.tracking_number || null,
            sender: body.sender || null,
            parcel_type: body.parcel_type || null,
            received_by: body.received_by || null,
            notes: body.notes || null,
            received_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        await emitEvent(ctx, "parcel_received", {
          parcel_id: data.id,
          building_id: body.building_id,
          recipient: body.resident_id,
        });

        return success(data, 201);
      }

      if (method === "PATCH") {
        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const body = await req.json();
        const updates: Record<string, unknown> = {};
        if (body.status) {
          updates.status = body.status;
          if (body.status === "notified") updates.notified_at = new Date().toISOString();
          if (body.status === "picked_up") updates.picked_up_at = new Date().toISOString();
        }

        const { data, error } = await ctx.supabase
          .from("parcels")
          .update(updates)
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .select()
          .single();

        if (error) throw error;
        return success(data);
      }
    }

    // ── VISITOR LOG (access_logs) ──
    if (action === "visitors" || !action) {
      if (method === "GET") {
        const id = url.searchParams.get("id");
        if (id) {
          const { data, error } = await ctx.supabase
            .from("access_logs")
            .select("*, buildings(name)")
            .eq("id", id)
            .eq("tenant_id", ctx.tenantId)
            .single();

          if (error || !data) return notFound("Access log");
          return success(data);
        }

        const { page, limit, offset } = parsePagination(url);
        const buildingId = url.searchParams.get("building_id");
        const visitorType = url.searchParams.get("visitor_type");
        const search = url.searchParams.get("search");

        let query = ctx.supabase
          .from("access_logs")
          .select("*, buildings(name)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("checked_in_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (buildingId) query = query.eq("building_id", buildingId);
        if (visitorType) query = query.eq("visitor_type", visitorType);
        if (search) query = query.or(`visitor_name.ilike.%${search}%,vehicle_plate.ilike.%${search}%`);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      // POST — Check in visitor
      if (method === "POST") {
        const body = await req.json();
        const v = validate(body)
          .required("building_id")
          .required("visitor_name")
          .uuid("building_id")
          .string("visitor_name", { min: 1, max: 200 })
          .string("phone", { max: 20 })
          .string("vehicle_plate", { max: 20 })
          .enum("visitor_type", ["guest", "shipper", "contractor", "vip"]);

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("access_logs")
          .insert({
            tenant_id: ctx.tenantId,
            building_id: body.building_id,
            visitor_name: body.visitor_name,
            visitor_type: body.visitor_type || "guest",
            phone: body.phone || null,
            id_number: body.id_number || null,
            purpose: body.purpose || null,
            host_resident: body.host_resident || null,
            vehicle_plate: body.vehicle_plate || null,
            guard_id: body.guard_id || null,
            temp_card_number: body.temp_card_number || null,
            notes: body.notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        await emitEvent(ctx, "visitor_entered", {
          visitor_id: data.id,
          building_id: body.building_id,
          name: body.visitor_name,
          purpose: body.purpose,
        });

        await writeAuditLog(ctx, "check_in", "access_log", data.id, null, data);
        return success(data, 201);
      }

      // PATCH — Check out visitor
      if (method === "PATCH") {
        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const { data, error } = await ctx.supabase
          .from("access_logs")
          .update({ checked_out_at: new Date().toISOString() })
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .select()
          .single();

        if (error) throw error;
        return success(data);
      }
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
