import { authenticate, type AuthContext } from "../_shared/auth.ts";
import { requireRole } from "../_shared/permissions.ts";
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

    // ── SHIFT MANAGEMENT ──
    if (action === "shifts") {
      if (method === "GET") {
        const { page, limit, offset } = parsePagination(url);
        const buildingId = url.searchParams.get("building_id");
        const date = url.searchParams.get("date");
        const staffId = url.searchParams.get("staff_member_id");

        let query = ctx.supabase
          .from("shift_schedules")
          .select("*, staff_members(name, role), buildings(name)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("shift_date", { ascending: true })
          .range(offset, offset + limit - 1);

        if (buildingId) query = query.eq("building_id", buildingId);
        if (date) query = query.eq("shift_date", date);
        if (staffId) query = query.eq("staff_member_id", staffId);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        const denied = requireRole(ctx, "admin", "operator");
        if (denied) return denied;

        const body = await req.json();
        const v = validate(body)
          .required("staff_member_id")
          .required("building_id")
          .required("shift_date")
          .required("start_time")
          .required("end_time")
          .uuid("staff_member_id")
          .uuid("building_id")
          .enum("shift_type", ["day", "night", "overtime"]);

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("shift_schedules")
          .insert({
            tenant_id: ctx.tenantId,
            staff_member_id: body.staff_member_id,
            building_id: body.building_id,
            shift_date: body.shift_date,
            start_time: body.start_time,
            end_time: body.end_time,
            shift_type: body.shift_type || "day",
            notes: body.notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        await writeAuditLog(ctx, "create", "shift_schedule", data.id, null, data);
        return success(data, 201);
      }
    }

    // ── CHECK-IN ──
    if (action === "check_in" && method === "PATCH") {
      const id = url.searchParams.get("id");
      if (!id) return badRequest("id is required");

      const { data, error } = await ctx.supabase
        .from("staff_members")
        .update({
          status: "on-patrol",
          last_check_in: new Date().toISOString(),
          in_assigned_zone: true,
        })
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .select()
        .single();

      if (error) throw error;
      if (!data) return notFound("Staff member");

      await emitEvent(ctx, "shift_started", {
        staff_id: id,
        building_id: data.building_id,
        check_in_time: data.last_check_in,
      });

      return success(data);
    }

    // ── STAFF CRUD ──
    if (method === "GET") {
      const id = url.searchParams.get("id");

      if (id) {
        const { data, error } = await ctx.supabase
          .from("staff_members")
          .select("*, buildings(name)")
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .single();

        if (error || !data) return notFound("Staff member");
        return success(data);
      }

      const { page, limit, offset } = parsePagination(url);
      const buildingId = url.searchParams.get("building_id");
      const status = url.searchParams.get("status");
      const role = url.searchParams.get("role");
      const search = url.searchParams.get("search");

      let query = ctx.supabase
        .from("staff_members")
        .select("*, buildings(name)", { count: "exact" })
        .eq("tenant_id", ctx.tenantId)
        .order("name", { ascending: true })
        .range(offset, offset + limit - 1);

      if (buildingId) query = query.eq("building_id", buildingId);
      if (status) query = query.eq("status", status);
      if (role) query = query.eq("role", role);
      if (search) query = query.ilike("name", `%${search}%`);

      const { data, count, error } = await query;
      if (error) throw error;
      return success(paginatedResponse(data || [], count, page, limit));
    }

    if (method === "POST") {
      const denied = requireRole(ctx, "admin", "operator");
      if (denied) return denied;

      const body = await req.json();
      const v = validate(body)
        .required("name")
        .string("name", { min: 1, max: 100 })
        .string("phone", { max: 20 })
        .string("zone", { max: 100 })
        .uuid("building_id")
        .enum("status", ["on-patrol", "stationary", "offline"]);

      if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

      const { data, error } = await ctx.supabase
        .from("staff_members")
        .insert({
          tenant_id: ctx.tenantId,
          name: body.name,
          role: body.role || "Bảo vệ",
          building_id: body.building_id || null,
          phone: body.phone || null,
          zone: body.zone || null,
          employee_id: body.employee_id || null,
          status: body.status || "offline",
        })
        .select()
        .single();

      if (error) throw error;

      await writeAuditLog(ctx, "create", "staff_member", data.id, null, data);
      return success(data, 201);
    }

    if (method === "PATCH" && !action) {
      const denied = requireRole(ctx, "admin", "operator");
      if (denied) return denied;

      const id = url.searchParams.get("id");
      if (!id) return badRequest("id is required");

      const body = await req.json();
      const { data: old } = await ctx.supabase
        .from("staff_members")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .single();

      if (!old) return notFound("Staff member");

      const updates: Record<string, unknown> = {};
      const fields = ["name", "role", "building_id", "phone", "zone", "status", "in_assigned_zone"];
      for (const f of fields) {
        if (body[f] !== undefined) updates[f] = body[f];
      }

      const { data, error } = await ctx.supabase
        .from("staff_members")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .select()
        .single();

      if (error) throw error;

      await writeAuditLog(ctx, "update", "staff_member", id, old, data);

      // Emit event if guard left zone
      if (body.in_assigned_zone === false && old.in_assigned_zone === true) {
        await emitEvent(ctx, "staff_out_of_zone", {
          staff_id: id,
          building_id: data.building_id,
          zone: data.zone,
        });
      }

      return success(data);
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
