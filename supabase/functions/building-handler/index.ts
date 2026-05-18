import { authenticate, type AuthContext } from "../_shared/auth.ts";
import { requireRole } from "../_shared/permissions.ts";
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

    // GET — List or single building
    if (method === "GET") {
      const id = url.searchParams.get("id");

      if (id) {
        const { data, error } = await ctx.supabase
          .from("buildings")
          .select("*, staff_members(id, name, status), incidents(id, severity, status)")
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .single();

        if (error || !data) return notFound("Building");
        return success(data);
      }

      const { page, limit, offset } = parsePagination(url);
      const status = url.searchParams.get("status");
      const region = url.searchParams.get("region");
      const search = url.searchParams.get("search");

      let query = ctx.supabase
        .from("buildings")
        .select("*", { count: "exact" })
        .eq("tenant_id", ctx.tenantId)
        .order("name", { ascending: true })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq("status", status);
      if (region) query = query.eq("region", region);
      if (search) query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);

      const { data, count, error } = await query;
      if (error) throw error;

      return success(paginatedResponse(data || [], count, page, limit));
    }

    // POST — Create building (admin only)
    if (method === "POST") {
      const denied = requireRole(ctx, "admin");
      if (denied) return denied;

      const body = await req.json();
      const v = validate(body)
        .required("name")
        .string("name", { min: 1, max: 200 })
        .string("address", { max: 500 })
        .string("region", { max: 100 })
        .number("lat", { min: -90, max: 90 })
        .number("lng", { min: -180, max: 180 })
        .enum("status", ["normal", "warning", "critical"]);

      if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

      const { data, error } = await ctx.supabase
        .from("buildings")
        .insert({
          tenant_id: ctx.tenantId,
          name: body.name,
          address: body.address || null,
          region: body.region || null,
          lat: body.lat || null,
          lng: body.lng || null,
          management_company: body.management_company || null,
          status: body.status || "normal",
        })
        .select()
        .single();

      if (error) throw error;

      await writeAuditLog(ctx, "create", "building", data.id, null, data);
      return success(data, 201);
    }

    // PATCH — Update building (admin only)
    if (method === "PATCH") {
      const denied = requireRole(ctx, "admin");
      if (denied) return denied;

      const id = url.searchParams.get("id");
      if (!id) return badRequest("id is required");

      const body = await req.json();
      const v = validate(body)
        .string("name", { min: 1, max: 200 })
        .string("address", { max: 500 })
        .enum("status", ["normal", "warning", "critical"]);

      if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

      // Get old data for audit
      const { data: old } = await ctx.supabase
        .from("buildings")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .single();

      if (!old) return notFound("Building");

      const updates: Record<string, unknown> = {};
      const fields = ["name", "address", "region", "lat", "lng", "management_company", "status"];
      for (const f of fields) {
        if (body[f] !== undefined) updates[f] = body[f];
      }

      const { data, error } = await ctx.supabase
        .from("buildings")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .select()
        .single();

      if (error) throw error;

      await writeAuditLog(ctx, "update", "building", id, old, data);

      // Emit event if status changed
      if (body.status && body.status !== old.status) {
        const { emitEvent } = await import("../_shared/audit.ts");
        await emitEvent(ctx, "building_status_changed", {
          building_id: id,
          old_status: old.status,
          new_status: body.status,
        });
      }

      return success(data);
    }

    // DELETE — Delete building (admin only)
    if (method === "DELETE") {
      const denied = requireRole(ctx, "admin");
      if (denied) return denied;

      const id = url.searchParams.get("id");
      if (!id) return badRequest("id is required");

      const { data: old } = await ctx.supabase
        .from("buildings")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .single();

      if (!old) return notFound("Building");

      const { error } = await ctx.supabase
        .from("buildings")
        .delete()
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId);

      if (error) throw error;

      await writeAuditLog(ctx, "delete", "building", id, old, null);
      return success({ deleted: true });
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
