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

    // ── EMPLOYEES ──
    if (!action || action === "employees") {
      const denied = requireRole(ctx, "admin", "hr_manager");

      if (method === "GET") {
        const id = url.searchParams.get("id");
        if (id) {
          const { data, error } = await ctx.supabase
            .from("employees")
            .select("*, buildings(name)")
            .eq("id", id)
            .eq("tenant_id", ctx.tenantId)
            .single();

          if (error || !data) return notFound("Employee");
          return success(data);
        }

        const { page, limit, offset } = parsePagination(url);
        const buildingId = url.searchParams.get("building_id");
        const status = url.searchParams.get("status");
        const department = url.searchParams.get("department");
        const search = url.searchParams.get("search");

        let query = ctx.supabase
          .from("employees")
          .select("*, buildings(name)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("full_name", { ascending: true })
          .range(offset, offset + limit - 1);

        if (buildingId) query = query.eq("building_id", buildingId);
        if (status) query = query.eq("status", status);
        if (department) query = query.eq("department", department);
        if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        if (denied) return denied;
        const body = await req.json();
        const v = validate(body)
          .required("full_name")
          .required("position")
          .string("full_name", { min: 1, max: 100 })
          .string("position", { min: 1, max: 100 })
          .string("email", { max: 255 })
          .string("phone", { max: 20 })
          .enum("status", ["active", "probation", "on_leave", "terminated"]);

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("employees")
          .insert({
            tenant_id: ctx.tenantId,
            full_name: body.full_name,
            position: body.position,
            department: body.department || null,
            email: body.email || null,
            phone: body.phone || null,
            building_id: body.building_id || null,
            hire_date: body.hire_date || null,
            salary: body.salary || null,
            id_number: body.id_number || null,
            address: body.address || null,
            certifications: body.certifications || null,
            status: body.status || "active",
          })
          .select()
          .single();

        if (error) throw error;
        await writeAuditLog(ctx, "create", "employee", data.id, null, data);
        return success(data, 201);
      }

      if (method === "PATCH") {
        if (denied) return denied;
        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const body = await req.json();
        const updates: Record<string, unknown> = {};
        const fields = [
          "full_name", "position", "department", "email", "phone",
          "building_id", "hire_date", "salary", "id_number", "address",
          "certifications", "status",
        ];
        for (const f of fields) {
          if (body[f] !== undefined) updates[f] = body[f];
        }

        const { data, error } = await ctx.supabase
          .from("employees")
          .update(updates)
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .select()
          .single();

        if (error) throw error;
        return success(data);
      }
    }

    // ── LEAVE REQUESTS ──
    if (action === "leave") {
      if (method === "GET") {
        const { page, limit, offset } = parsePagination(url);
        const employeeId = url.searchParams.get("employee_id");
        const status = url.searchParams.get("status");

        let query = ctx.supabase
          .from("leave_requests")
          .select("*, employees(full_name, position)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (employeeId) query = query.eq("employee_id", employeeId);
        if (status) query = query.eq("status", status);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        const body = await req.json();
        const v = validate(body)
          .required("employee_id")
          .required("start_date")
          .required("end_date")
          .uuid("employee_id")
          .date("start_date")
          .date("end_date");

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("leave_requests")
          .insert({
            tenant_id: ctx.tenantId,
            employee_id: body.employee_id,
            leave_type: body.leave_type || "annual",
            start_date: body.start_date,
            end_date: body.end_date,
            reason: body.reason || null,
            status: "pending",
          })
          .select()
          .single();

        if (error) throw error;
        return success(data, 201);
      }

      if (method === "PATCH") {
        const denied = requireRole(ctx, "admin", "hr_manager");
        if (denied) return denied;

        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const body = await req.json();
        const updates: Record<string, unknown> = {};
        if (body.status) {
          updates.status = body.status;
          if (body.status === "approved") {
            updates.approved_by = ctx.user.id;
            updates.approved_at = new Date().toISOString();
          }
        }

        const { data, error } = await ctx.supabase
          .from("leave_requests")
          .update(updates)
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .select("*, employees(full_name)")
          .single();

        if (error) throw error;

        if (body.status === "approved") {
          await emitEvent(ctx, "leave_approved", {
            leave_id: id,
            employee_id: data.employee_id,
            start_date: data.start_date,
            end_date: data.end_date,
          });
        }

        return success(data);
      }
    }

    // ── TRAINING COURSES ──
    if (action === "training") {
      if (method === "GET") {
        const { page, limit, offset } = parsePagination(url);
        const category = url.searchParams.get("category");

        let query = ctx.supabase
          .from("training_courses")
          .select("*", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("title", { ascending: true })
          .range(offset, offset + limit - 1);

        if (category) query = query.eq("category", category);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        const denied = requireRole(ctx, "admin", "hr_manager");
        if (denied) return denied;

        const body = await req.json();
        const v = validate(body)
          .required("title")
          .string("title", { min: 1, max: 200 });

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("training_courses")
          .insert({
            tenant_id: ctx.tenantId,
            title: body.title,
            description: body.description || null,
            category: body.category || null,
            duration_hours: body.duration_hours || null,
            is_mandatory: body.is_mandatory || false,
            pass_score: body.pass_score || null,
          })
          .select()
          .single();

        if (error) throw error;
        return success(data, 201);
      }
    }

    // ── TRAINING ENROLLMENTS ──
    if (action === "enrollments") {
      if (method === "GET") {
        const { page, limit, offset } = parsePagination(url);
        const courseId = url.searchParams.get("course_id");
        const employeeId = url.searchParams.get("employee_id");

        let query = ctx.supabase
          .from("training_enrollments")
          .select("*, training_courses(title, category), employees(full_name)", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (courseId) query = query.eq("course_id", courseId);
        if (employeeId) query = query.eq("employee_id", employeeId);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        const body = await req.json();
        const v = validate(body)
          .required("course_id")
          .required("employee_id")
          .uuid("course_id")
          .uuid("employee_id");

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("training_enrollments")
          .insert({
            course_id: body.course_id,
            employee_id: body.employee_id,
            status: "enrolled",
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
        if (body.status) updates.status = body.status;
        if (body.score !== undefined) updates.score = body.score;
        if (body.status === "completed") updates.completed_at = new Date().toISOString();

        const { data, error } = await ctx.supabase
          .from("training_enrollments")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return success(data);
      }
    }

    // ── CERTIFICATIONS ──
    if (action === "certifications") {
      if (method === "GET") {
        const { page, limit, offset } = parsePagination(url);
        const employeeId = url.searchParams.get("employee_id");
        const status = url.searchParams.get("status");

        let query = ctx.supabase
          .from("certifications")
          .select("*, employees(full_name)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("expiry_date", { ascending: true })
          .range(offset, offset + limit - 1);

        if (employeeId) query = query.eq("employee_id", employeeId);
        if (status) query = query.eq("status", status);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        const denied = requireRole(ctx, "admin", "hr_manager");
        if (denied) return denied;

        const body = await req.json();
        const v = validate(body)
          .required("employee_id")
          .required("cert_name")
          .uuid("employee_id")
          .string("cert_name", { min: 1, max: 200 });

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const { data, error } = await ctx.supabase
          .from("certifications")
          .insert({
            tenant_id: ctx.tenantId,
            employee_id: body.employee_id,
            cert_name: body.cert_name,
            issuing_authority: body.issuing_authority || null,
            issued_date: body.issued_date || null,
            expiry_date: body.expiry_date || null,
            document_url: body.document_url || null,
            status: "active",
          })
          .select()
          .single();

        if (error) throw error;
        return success(data, 201);
      }
    }

    return methodNotAllowed();
  } catch (err) {
    return serverError(err);
  }
});
