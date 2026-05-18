import { authenticate, type AuthContext } from "../_shared/auth.ts";
import { parsePagination, paginatedResponse } from "../_shared/pagination.ts";
import { validate } from "../_shared/validation.ts";
import { writeAuditLog } from "../_shared/audit.ts";
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

    // ── GET ──
    if (method === "GET") {
      const id = url.searchParams.get("id");

      if (id) {
        const { data, error } = await ctx.supabase
          .from("residents")
          .select("*, buildings(name)")
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .single();

        if (error || !data) return notFound("Resident");
        return success(data);
      }

      const { page, limit, offset } = parsePagination(url);
      const buildingId = url.searchParams.get("building_id");
      const status = url.searchParams.get("status");
      const isElderly = url.searchParams.get("is_elderly");
      const isChild = url.searchParams.get("is_child_household");
      const search = url.searchParams.get("search");

      let query = ctx.supabase
        .from("residents")
        .select("*, buildings(name)", { count: "exact" })
        .eq("tenant_id", ctx.tenantId)
        .order("full_name", { ascending: true })
        .range(offset, offset + limit - 1);

      if (buildingId) query = query.eq("building_id", buildingId);
      if (status) query = query.eq("status", status);
      if (isElderly === "true") query = query.eq("is_elderly", true);
      if (isChild === "true") query = query.eq("is_child_household", true);
      if (search) query = query.or(`full_name.ilike.%${search}%,apartment.ilike.%${search}%,phone.ilike.%${search}%`);

      const { data, count, error } = await query;
      if (error) throw error;
      return success(paginatedResponse(data || [], count, page, limit));
    }

    // ── POST ──
    if (method === "POST") {
      const body = await req.json();
      const v = validate(body)
        .required("full_name")
        .required("apartment")
        .required("building_id")
        .string("full_name", { min: 1, max: 100 })
        .string("apartment", { min: 1, max: 20 })
        .uuid("building_id")
        .string("phone", { max: 20 })
        .string("email", { max: 255 })
        .string("emergency_contact", { max: 100 })
        .string("emergency_phone", { max: 20 })
        .string("special_notes", { max: 1000 });

      if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

      const { data, error } = await ctx.supabase
        .from("residents")
        .insert({
          tenant_id: ctx.tenantId,
          full_name: body.full_name,
          apartment: body.apartment,
          building_id: body.building_id,
          phone: body.phone || null,
          email: body.email || null,
          move_in_date: body.move_in_date || null,
          is_elderly: body.is_elderly || false,
          is_child_household: body.is_child_household || false,
          vehicle_plates: body.vehicle_plates || null,
          emergency_contact: body.emergency_contact || null,
          emergency_phone: body.emergency_phone || null,
          special_notes: body.special_notes || null,
          status: body.status || "active",
        })
        .select()
        .single();

      if (error) throw error;

      await writeAuditLog(ctx, "create", "resident", data.id, null, data);
      return success(data, 201);
    }

    // ── PATCH ──
    if (method === "PATCH") {
      const id = url.searchParams.get("id");
      if (!id) return badRequest("id is required");

      const body = await req.json();
      const { data: old } = await ctx.supabase
        .from("residents")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .single();

      if (!old) return notFound("Resident");

      const updates: Record<string, unknown> = {};
      const fields = [
        "full_name", "apartment", "building_id", "phone", "email",
        "move_in_date", "is_elderly", "is_child_household",
        "vehicle_plates", "emergency_contact", "emergency_phone",
        "special_notes", "status",
      ];
      for (const f of fields) {
        if (body[f] !== undefined) updates[f] = body[f];
      }

      const { data, error } = await ctx.supabase
        .from("residents")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .select()
        .single();

      if (error) throw error;

      await writeAuditLog(ctx, "update", "resident", id, old, data);
      return success(data);
    }

    // ── DELETE ──
    if (method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return badRequest("id is required");

      const { data: old } = await ctx.supabase
        .from("residents")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .single();

      if (!old) return notFound("Resident");

      const { error } = await ctx.supabase
        .from("residents")
        .delete()
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId);

      if (error) throw error;

      await writeAuditLog(ctx, "delete", "resident", id, old, null);
      return success({ deleted: true });
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
