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
    const type = url.searchParams.get("type"); // "support" or "quick"

    const table = type === "quick" ? "quick_service_requests" : "support_requests";

    // ── GET ──
    if (method === "GET") {
      const id = url.searchParams.get("id");
      if (id) {
        const selectFields = type === "quick"
          ? "*, buildings(name), residents(full_name, apartment), staff_members(name)"
          : "*, buildings(name), residents(full_name, apartment), staff_members(name)";

        const { data, error } = await ctx.supabase
          .from(table)
          .select(selectFields)
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .single();

        if (error || !data) return notFound("Service request");
        return success(data);
      }

      const { page, limit, offset } = parsePagination(url);
      const buildingId = url.searchParams.get("building_id");
      const status = url.searchParams.get("status");
      const priority = url.searchParams.get("priority");
      const residentId = url.searchParams.get("resident_id");

      let query = ctx.supabase
        .from(table)
        .select("*, buildings(name), residents(full_name)", { count: "exact" })
        .eq("tenant_id", ctx.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (buildingId) query = query.eq("building_id", buildingId);
      if (status) query = query.eq("status", status);
      if (residentId) query = query.eq("resident_id", residentId);
      if (priority && type === "support") query = query.eq("priority", priority);

      const { data, count, error } = await query;
      if (error) throw error;
      return success(paginatedResponse(data || [], count, page, limit));
    }

    // ── POST ──
    if (method === "POST") {
      const body = await req.json();

      if (type === "quick") {
        const v = validate(body)
          .required("building_id")
          .required("service_type")
          .uuid("building_id")
          .string("service_type", { min: 1, max: 100 })
          .string("description", { max: 1000 })
          .uuid("resident_id");

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("quick_service_requests")
          .insert({
            tenant_id: ctx.tenantId,
            building_id: body.building_id,
            service_type: body.service_type,
            description: body.description || null,
            resident_id: body.resident_id || null,
            scheduled_at: body.scheduled_at || null,
            status: "open",
          })
          .select()
          .single();

        if (error) throw error;
        return success(data, 201);
      }

      // Support request
      const v = validate(body)
        .required("building_id")
        .required("title")
        .uuid("building_id")
        .string("title", { min: 1, max: 200 })
        .string("description", { max: 2000 })
        .string("category", { max: 50 })
        .enum("priority", ["high", "medium", "low"]);

      if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

      const { data, error } = await ctx.supabase
        .from("support_requests")
        .insert({
          tenant_id: ctx.tenantId,
          building_id: body.building_id,
          title: body.title,
          description: body.description || null,
          category: body.category || null,
          priority: body.priority || "medium",
          resident_id: body.resident_id || null,
          status: "open",
        })
        .select()
        .single();

      if (error) throw error;

      await emitEvent(ctx, "support_request_created", {
        request_id: data.id,
        building_id: body.building_id,
        priority: data.priority,
        category: data.category,
      });

      return success(data, 201);
    }

    // ── PATCH ──
    if (method === "PATCH") {
      const id = url.searchParams.get("id");
      if (!id) return badRequest("id is required");

      const body = await req.json();
      const updates: Record<string, unknown> = {};

      if (body.status) {
        updates.status = body.status;
        if (body.status === "resolved") {
          updates.resolved_at = new Date().toISOString();
          if (type === "quick") updates.completed_at = new Date().toISOString();
        }
      }
      if (body.assignee_id) updates.assignee_id = body.assignee_id;
      if (type === "quick" && body.assigned_to) updates.assigned_to = body.assigned_to;
      if (body.priority) updates.priority = body.priority;
      if (body.cost !== undefined) updates.cost = body.cost;

      const { data, error } = await ctx.supabase
        .from(table)
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .select()
        .single();

      if (error) throw error;
      return success(data);
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
