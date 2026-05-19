import { authenticate } from "../_shared/auth.ts";
import { authenticateResident } from "../_shared/mobile-auth.ts";
import { emitEvent } from "../_shared/audit.ts";
import { corsResponse } from "../_shared/cors.ts";
import { badRequest, methodNotAllowed, serverError, success, notFound } from "../_shared/errors.ts";
import { validate } from "../_shared/validation.ts";
import { buildFamilyDashboard, buildFamilySpendingDetail } from "../_shared/family-dashboard.ts";

const APP_STATUSES_NO_CANCEL = ["en_route", "on_site", "completed"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsResponse();

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // LIFE-001: user chưa có resident — chỉ cần JWT, không cần role resident
    if (req.method === "POST" && action === "activate") {
      const authResult = await authenticate(req);
      if (authResult instanceof Response) return authResult;
      const auth = authResult;

      const body = await req.json();
      const code = String(body.code || "").trim().toUpperCase();
      if (!code) return badRequest("code is required");

      const { data: row } = await auth.supabase
        .from("resident_activation_codes")
        .select("*, residents(*)")
        .eq("tenant_id", auth.tenantId)
        .eq("code", code)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (!row) return badRequest("Invalid or expired code");

      await auth.supabase
        .from("residents")
        .update({ user_id: auth.user.id, status: "active" })
        .eq("id", row.resident_id);

      await auth.supabase
        .from("resident_activation_codes")
        .update({ used_at: new Date().toISOString() })
        .eq("id", row.id);

      await auth.supabase.from("user_roles").upsert(
        { user_id: auth.user.id, tenant_id: auth.tenantId, role: "resident" },
        { onConflict: "user_id,tenant_id,role" }
      );

      const { data: resident } = await auth.supabase
        .from("residents")
        .select("*, buildings(name)")
        .eq("id", row.resident_id)
        .single();

      return success({ success: true, data: resident });
    }

    const result = await authenticateResident(req);
    if (result instanceof Response) return result;
    const ctx = result;

    if (req.method === "POST" && action === "cancel-request") {
      const body = await req.json();
      const { data: reqRow } = await ctx.supabase
        .from("quick_service_requests")
        .select("*")
        .eq("id", body.request_id)
        .eq("resident_id", ctx.residentId)
        .single();

      if (!reqRow) return notFound("Request");
      if (APP_STATUSES_NO_CANCEL.includes(reqRow.app_status || "")) {
        return new Response(
          JSON.stringify({ success: false, error: { code: "ERR-REQ-03", message: "Cannot cancel while guard is en route" } }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      const { data } = await ctx.supabase
        .from("quick_service_requests")
        .update({ app_status: "cancelled", status: "cancelled" })
        .eq("id", body.request_id)
        .select()
        .single();

      return success({ success: true, data });
    }

    if (req.method === "POST" && action === "rate") {
      const body = await req.json();
      const v = validate(body).required("request_id").required("request_type").enum("request_type", ["quick", "support"]);
      if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

      const table = body.request_type === "quick" ? "quick_service_requests" : "support_requests";
      const assignCol = body.request_type === "quick" ? "assigned_to" : "assignee_id";

      const { data: reqRow } = await ctx.supabase.from(table).select("*").eq("id", body.request_id).single();
      if (!reqRow || reqRow.app_status !== "completed") return badRequest("Request not completed");

      const staffId = reqRow[assignCol];
      if (!staffId) return badRequest("No guard assigned");

      const { data, error } = await ctx.supabase
        .from("service_ratings")
        .insert({
          tenant_id: ctx.tenantId,
          request_type: body.request_type,
          request_id: body.request_id,
          resident_id: ctx.residentId,
          staff_member_id: staffId,
          stars: body.stars,
          comment: body.comment || null,
        })
        .select()
        .single();

      if (error) throw error;
      if (body.stars <= 2) {
        await emitEvent(ctx, "low_rating_alert", { request_id: body.request_id, stars: body.stars });
      }
      return success({ success: true, data }, 201);
    }

    if (action === "visitor-invite") {
      if (req.method === "GET") {
        const { data } = await ctx.supabase
          .from("visitor_invites")
          .select("*")
          .eq("resident_id", ctx.residentId)
          .order("created_at", { ascending: false });
        return success({ success: true, data });
      }
      if (req.method === "POST") {
        const body = await req.json();
        const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
        const { data, error } = await ctx.supabase
          .from("visitor_invites")
          .insert({
            tenant_id: ctx.tenantId,
            building_id: ctx.buildingId,
            resident_id: ctx.residentId,
            visitor_name: body.visitor_name,
            visit_start: body.visit_start,
            visit_end: body.visit_end,
            vehicle_plate: body.vehicle_plate || null,
            purpose: body.purpose || null,
            qr_token: token,
          })
          .select()
          .single();
        if (error) throw error;
        return success({
          success: true,
          data: { ...data, qr_payload: `STOS:${token}`, display_code: token },
        }, 201);
      }
    }

    if (req.method === "GET" && action === "family-dashboard") {
      const dashboard = await buildFamilyDashboard(ctx.supabase, ctx.residentId, ctx.tenantId);
      if (!dashboard) return notFound("Household");
      return success({ success: true, data: dashboard });
    }

    if (req.method === "GET" && action === "family-spending") {
      const year = parseInt(url.searchParams.get("year") || String(new Date().getFullYear()), 10);
      const month = parseInt(url.searchParams.get("month") || String(new Date().getMonth() + 1), 10);
      const detail = await buildFamilySpendingDetail(ctx.supabase, ctx.residentId, year, month);
      if (!detail) return notFound("Spending month");
      return success({ success: true, data: detail });
    }

    if (req.method === "PATCH" && action === "preferences") {
      const body = await req.json();
      const { data, error } = await ctx.supabase
        .from("notification_preferences")
        .upsert({
          user_id: ctx.user.id,
          tenant_id: ctx.tenantId,
          preferences: body.preferences || {},
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,tenant_id" })
        .select()
        .single();
      if (error) throw error;
      return success({ success: true, data });
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
