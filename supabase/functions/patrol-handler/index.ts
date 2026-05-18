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

    // ── GET — List patrols ──
    if (method === "GET") {
      const { page, limit, offset } = parsePagination(url);
      const buildingId = url.searchParams.get("building_id");
      const status = url.searchParams.get("status");
      const guardId = url.searchParams.get("guard_id");

      let query = ctx.supabase
        .from("patrol_routes")
        .select("*, buildings(name), staff_members(name), patrol_checkpoints(*)", { count: "exact" })
        .eq("tenant_id", ctx.tenantId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (buildingId) query = query.eq("building_id", buildingId);
      if (status) query = query.eq("status", status);
      if (guardId) query = query.eq("guard_id", guardId);

      const { data, count, error } = await query;
      if (error) throw error;
      return success(paginatedResponse(data || [], count, page, limit));
    }

    // ── POST — Create route + checkpoints ──
    if (method === "POST") {
      const body = await req.json();
      const v = validate(body)
        .required("building_id")
        .uuid("building_id")
        .uuid("guard_id");

      if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

      if (!body.checkpoints || !Array.isArray(body.checkpoints) || body.checkpoints.length === 0) {
        return badRequest("At least 1 checkpoint is required");
      }

      const { data: route, error } = await ctx.supabase
        .from("patrol_routes")
        .insert({
          tenant_id: ctx.tenantId,
          building_id: body.building_id,
          guard_id: body.guard_id || null,
          status: "active",
          start_time: new Date().toISOString(),
          notes: body.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Create checkpoints
      const cpData = body.checkpoints.map(
        (cp: { name: string; sequence_order?: number }, i: number) => ({
          route_id: route.id,
          name: cp.name,
          sequence_order: cp.sequence_order ?? i + 1,
        })
      );
      await ctx.supabase.from("patrol_checkpoints").insert(cpData);

      await writeAuditLog(ctx, "create", "patrol_route", route.id, null, route);
      return success(route, 201);
    }

    // ── PATCH ──
    if (method === "PATCH") {
      const checkpointId = url.searchParams.get("checkpoint_id");
      const routeId = url.searchParams.get("route_id");

      // Complete checkpoint
      if (checkpointId) {
        const { data, error } = await ctx.supabase
          .from("patrol_checkpoints")
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq("id", checkpointId)
          .select()
          .single();

        if (error) throw error;

        // Recalculate route completion
        const { data: allCps } = await ctx.supabase
          .from("patrol_checkpoints")
          .select("completed")
          .eq("route_id", data.route_id);

        if (allCps) {
          const total = allCps.length;
          const done = allCps.filter((c: { completed: boolean }) => c.completed).length;
          const completion = Math.round((done / total) * 100);

          const routeUpdates: Record<string, unknown> = { completion };
          if (done === total) {
            routeUpdates.status = "completed";
            routeUpdates.end_time = new Date().toISOString();

            await emitEvent(ctx, "patrol_completed", {
              patrol_route_id: data.route_id,
              guard_id: null,
              building_id: null,
              completion_percent: 100,
            });
          }

          await ctx.supabase
            .from("patrol_routes")
            .update(routeUpdates)
            .eq("id", data.route_id);
        }

        return success(data);
      }

      // Update route
      if (routeId) {
        const body = await req.json();
        const updates: Record<string, unknown> = {};
        const fields = ["status", "guard_id", "notes", "end_time"];
        for (const f of fields) {
          if (body[f] !== undefined) updates[f] = body[f];
        }

        if (body.status === "missed") {
          await emitEvent(ctx, "patrol_checkpoint_missed", {
            patrol_route_id: routeId,
            building_id: null,
          });

          await ctx.supabase.from("alerts").insert({
            tenant_id: ctx.tenantId,
            type: "patrol_violation",
            description: `Patrol route missed: ${routeId}`,
          });
        }

        const { data, error } = await ctx.supabase
          .from("patrol_routes")
          .update(updates)
          .eq("id", routeId)
          .eq("tenant_id", ctx.tenantId)
          .select()
          .single();

        if (error) throw error;
        return success(data);
      }

      return badRequest("checkpoint_id or route_id required");
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
