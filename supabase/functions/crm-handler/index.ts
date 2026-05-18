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
    const action = url.searchParams.get("action");

    // ── CLIENTS ──
    if (!action || action === "clients") {
      if (method === "GET") {
        const id = url.searchParams.get("id");
        if (id) {
          const { data, error } = await ctx.supabase
            .from("clients")
            .select("*, client_buildings(building_id, buildings(name))")
            .eq("id", id)
            .eq("tenant_id", ctx.tenantId)
            .single();

          if (error || !data) return notFound("Client");
          return success(data);
        }

        const { page, limit, offset } = parsePagination(url);
        const status = url.searchParams.get("status");
        const contractStatus = url.searchParams.get("contract_status");
        const search = url.searchParams.get("search");

        let query = ctx.supabase
          .from("clients")
          .select("*", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("name", { ascending: true })
          .range(offset, offset + limit - 1);

        if (status) query = query.eq("status", status);
        if (contractStatus) query = query.eq("contract_status", contractStatus);
        if (search) query = query.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%`);

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
          .string("name", { min: 1, max: 200 })
          .enum("status", ["active", "negotiating", "prospect", "churned"])
          .enum("contract_status", ["active", "expiring", "expired", "draft"]);

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("clients")
          .insert({
            tenant_id: ctx.tenantId,
            name: body.name,
            contact_person: body.contact_person || null,
            phone: body.phone || null,
            email: body.email || null,
            type: body.type || "bql",
            status: body.status || "prospect",
            contract_value: body.contract_value || 0,
            contract_start: body.contract_start || null,
            contract_end: body.contract_end || null,
            contract_status: body.contract_status || "draft",
            guards_count: body.guards_count || 0,
            sla: body.sla || 0,
            notes: body.notes || null,
          })
          .select()
          .single();

        if (error) throw error;
        await writeAuditLog(ctx, "create", "client", data.id, null, data);
        return success(data, 201);
      }

      if (method === "PATCH") {
        const denied = requireRole(ctx, "admin", "operator");
        if (denied) return denied;

        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const body = await req.json();
        const updates: Record<string, unknown> = {};
        const fields = [
          "name", "contact_person", "phone", "email", "type", "status",
          "contract_value", "contract_start", "contract_end", "contract_status",
          "guards_count", "sla", "satisfaction", "notes", "last_contact_at",
        ];
        for (const f of fields) {
          if (body[f] !== undefined) updates[f] = body[f];
        }

        const { data, error } = await ctx.supabase
          .from("clients")
          .update(updates)
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .select()
          .single();

        if (error) throw error;
        return success(data);
      }

      if (method === "DELETE") {
        const denied = requireRole(ctx, "admin");
        if (denied) return denied;

        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const { error } = await ctx.supabase
          .from("clients")
          .delete()
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId);

        if (error) throw error;
        return success({ deleted: true });
      }
    }

    // ── PIPELINE DEALS ──
    if (action === "deals") {
      if (method === "GET") {
        const { page, limit, offset } = parsePagination(url);
        const stage = url.searchParams.get("stage");
        const clientId = url.searchParams.get("client_id");

        let query = ctx.supabase
          .from("pipeline_deals")
          .select("*, clients(name)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("updated_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (stage) query = query.eq("stage", stage);
        if (clientId) query = query.eq("client_id", clientId);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        const body = await req.json();
        const v = validate(body)
          .required("name")
          .string("name", { min: 1, max: 200 })
          .enum("stage", ["lead", "meeting", "proposal", "negotiation", "closed", "lost"]);

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("pipeline_deals")
          .insert({
            tenant_id: ctx.tenantId,
            name: body.name,
            client_id: body.client_id || null,
            value: body.value || 0,
            probability: body.probability || 0,
            stage: body.stage || "lead",
            contact: body.contact || null,
            expected_close_date: body.expected_close_date || null,
            notes: body.notes || null,
          })
          .select()
          .single();

        if (error) throw error;
        return success(data, 201);
      }

      if (method === "PATCH") {
        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const body = await req.json();
        const updates: Record<string, unknown> = {};
        const fields = ["name", "client_id", "value", "probability", "stage", "contact", "expected_close_date", "notes", "days_in_stage"];
        for (const f of fields) {
          if (body[f] !== undefined) updates[f] = body[f];
        }

        const { data, error } = await ctx.supabase
          .from("pipeline_deals")
          .update(updates)
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .select()
          .single();

        if (error) throw error;
        return success(data);
      }
    }

    // ── CONTRACTORS ──
    if (action === "contractors") {
      if (method === "GET") {
        const { page, limit, offset } = parsePagination(url);
        const buildingId = url.searchParams.get("building_id");
        const status = url.searchParams.get("status");

        let query = ctx.supabase
          .from("contractors")
          .select("*, buildings(name)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("created_at", { ascending: false })
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
          .required("company_name")
          .required("work_type")
          .string("company_name", { min: 1, max: 200 });

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("contractors")
          .insert({
            tenant_id: ctx.tenantId,
            company_name: body.company_name,
            work_type: body.work_type,
            contact_person: body.contact_person || null,
            phone: body.phone || null,
            building_id: body.building_id || null,
            start_date: body.start_date || null,
            end_date: body.end_date || null,
            contract_value: body.contract_value || null,
            status: body.status || "scheduled",
            notes: body.notes || null,
          })
          .select()
          .single();

        if (error) throw error;
        return success(data, 201);
      }

      if (method === "PATCH") {
        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const body = await req.json();
        const updates: Record<string, unknown> = {};
        const fields = ["company_name", "work_type", "contact_person", "phone", "building_id", "start_date", "end_date", "contract_value", "status", "notes"];
        for (const f of fields) {
          if (body[f] !== undefined) updates[f] = body[f];
        }

        const { data, error } = await ctx.supabase
          .from("contractors")
          .update(updates)
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
