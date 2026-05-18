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
    const action = url.searchParams.get("action");

    // ── TIMELINE ──
    if (action === "timeline" && method === "POST") {
      const body = await req.json();
      const v = validate(body)
        .required("incident_id")
        .required("action")
        .uuid("incident_id")
        .string("action", { min: 1, max: 200 })
        .string("notes", { max: 1000 });

      if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

      // Get current incident status
      const { data: incident } = await ctx.supabase
        .from("incidents")
        .select("status")
        .eq("id", body.incident_id)
        .eq("tenant_id", ctx.tenantId)
        .single();

      const { data, error } = await ctx.supabase
        .from("incident_timeline")
        .insert({
          tenant_id: ctx.tenantId,
          incident_id: body.incident_id,
          action: body.action,
          performed_by: body.performed_by || null,
          old_status: incident?.status || null,
          new_status: body.new_status || null,
          notes: body.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return success(data, 201);
    }

    // ── GET ──
    if (method === "GET") {
      const id = url.searchParams.get("id");

      if (id) {
        const { data, error } = await ctx.supabase
          .from("incidents")
          .select("*, buildings(name), staff_members(name), incident_timeline(*)")
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .single();

        if (error) throw error;
        return success(data);
      }

      const { page, limit, offset } = parsePagination(url);
      const buildingId = url.searchParams.get("building_id");
      const status = url.searchParams.get("status");
      const severity = url.searchParams.get("severity");
      const type = url.searchParams.get("type");
      const dateFrom = url.searchParams.get("date_from");
      const dateTo = url.searchParams.get("date_to");

      let query = ctx.supabase
        .from("incidents")
        .select("*, buildings(name)", { count: "exact" })
        .eq("tenant_id", ctx.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (buildingId) query = query.eq("building_id", buildingId);
      if (status) query = query.eq("status", status);
      if (severity) query = query.eq("severity", severity);
      if (type) query = query.eq("type", type);
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo);

      const { data, count, error } = await query;
      if (error) throw error;
      return success(paginatedResponse(data || [], count, page, limit));
    }

    // ── POST ──
    if (method === "POST") {
      const body = await req.json();
      const v = validate(body)
        .required("building_id")
        .required("type")
        .uuid("building_id")
        .string("type", { min: 1, max: 100 })
        .string("description", { max: 2000 })
        .enum("severity", ["critical", "high", "medium", "low"]);

      if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

      const { data: incident, error } = await ctx.supabase
        .from("incidents")
        .insert({
          tenant_id: ctx.tenantId,
          building_id: body.building_id,
          reporter_id: body.reporter_id || ctx.user.id,
          severity: body.severity || "medium",
          type: body.type,
          description: body.description || null,
          assignee_id: body.assignee_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial timeline entry
      await ctx.supabase.from("incident_timeline").insert({
        tenant_id: ctx.tenantId,
        incident_id: incident.id,
        action: "Incident created",
        new_status: "new",
        notes: body.description,
      });

      // Emit event
      await emitEvent(ctx, "incident_created", {
        incident_id: incident.id,
        building_id: body.building_id,
        severity: incident.severity,
        type: body.type,
        reporter_id: incident.reporter_id,
      });

      // Auto-escalate critical
      if (incident.severity === "critical") {
        await ctx.supabase.from("alerts").insert({
          tenant_id: ctx.tenantId,
          building_id: body.building_id,
          type: "critical",
          description: `🚨 Critical: ${body.type} - ${body.description || "No description"}`,
        });
      }

      await writeAuditLog(ctx, "create", "incident", incident.id, null, incident);
      return success(incident, 201);
    }

    // ── PATCH ──
    if (method === "PATCH") {
      const id = url.searchParams.get("id");
      if (!id) return badRequest("id is required");

      const body = await req.json();

      // Get old data
      const { data: old } = await ctx.supabase
        .from("incidents")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .single();

      const updates: Record<string, unknown> = {};
      if (body.status) updates.status = body.status;
      if (body.assignee_id) updates.assignee_id = body.assignee_id;
      if (body.severity) updates.severity = body.severity;
      if (body.description) updates.description = body.description;
      if (body.status === "resolved") {
        updates.resolved_at = new Date().toISOString();
        if (old?.created_at) {
          updates.response_time_minutes = Math.round(
            (Date.now() - new Date(old.created_at).getTime()) / 60000
          );
        }
      }

      const { data, error } = await ctx.supabase
        .from("incidents")
        .update(updates)
        .eq("id", id)
        .eq("tenant_id", ctx.tenantId)
        .select()
        .single();

      if (error) throw error;

      // Add timeline entry for status change
      if (body.status && body.status !== old?.status) {
        await ctx.supabase.from("incident_timeline").insert({
          tenant_id: ctx.tenantId,
          incident_id: id,
          action: `Status changed to ${body.status}`,
          old_status: old?.status,
          new_status: body.status,
          notes: body.notes || null,
        });

        if (body.status === "escalated") {
          await emitEvent(ctx, "incident_escalated", {
            incident_id: id,
            building_id: data.building_id,
            severity: data.severity,
          });
        }

        if (body.status === "resolved") {
          await emitEvent(ctx, "incident_resolved", {
            incident_id: id,
            building_id: data.building_id,
            resolved_by: ctx.user.id,
            resolution_time: data.response_time_minutes,
          });
        }
      }

      await writeAuditLog(ctx, "update", "incident", id, old, data);
      return success(data);
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
