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

    const denied = requireRole(ctx, "admin", "finance_manager");

    // ── INVOICES ──
    if (!action || action === "invoices") {
      if (method === "GET") {
        const id = url.searchParams.get("id");
        if (id) {
          const { data, error } = await ctx.supabase
            .from("invoices")
            .select("*, clients(name)")
            .eq("id", id)
            .eq("tenant_id", ctx.tenantId)
            .single();

          if (error || !data) return notFound("Invoice");
          return success(data);
        }

        const { page, limit, offset } = parsePagination(url);
        const status = url.searchParams.get("status");
        const clientId = url.searchParams.get("client_id");

        let query = ctx.supabase
          .from("invoices")
          .select("*, clients(name)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (status) query = query.eq("status", status);
        if (clientId) query = query.eq("client_id", clientId);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        if (denied) return denied;
        const body = await req.json();
        const v = validate(body)
          .required("invoice_number")
          .string("invoice_number", { min: 1, max: 50 })
          .number("amount", { min: 0 })
          .number("tax", { min: 0 })
          .uuid("client_id");

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const amount = body.amount || 0;
        const tax = body.tax || 0;

        const { data, error } = await ctx.supabase
          .from("invoices")
          .insert({
            tenant_id: ctx.tenantId,
            invoice_number: body.invoice_number,
            client_id: body.client_id || null,
            amount,
            tax,
            total: amount + tax,
            due_date: body.due_date || null,
            status: body.status || "draft",
            notes: body.notes || null,
          })
          .select()
          .single();

        if (error) throw error;
        await writeAuditLog(ctx, "create", "invoice", data.id, null, data);
        return success(data, 201);
      }

      if (method === "PATCH") {
        if (denied) return denied;
        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const body = await req.json();
        const updates: Record<string, unknown> = {};
        const fields = ["invoice_number", "client_id", "amount", "tax", "due_date", "status", "notes"];
        for (const f of fields) {
          if (body[f] !== undefined) updates[f] = body[f];
        }

        // Recalculate total if amount or tax changed
        if (body.amount !== undefined || body.tax !== undefined) {
          const { data: current } = await ctx.supabase
            .from("invoices")
            .select("amount, tax")
            .eq("id", id)
            .single();

          if (current) {
            const amt = body.amount ?? current.amount;
            const tx = body.tax ?? current.tax;
            updates.total = amt + tx;
          }
        }

        if (body.status === "paid") {
          updates.paid_at = new Date().toISOString();
        }

        const { data, error } = await ctx.supabase
          .from("invoices")
          .update(updates)
          .eq("id", id)
          .eq("tenant_id", ctx.tenantId)
          .select()
          .single();

        if (error) throw error;
        return success(data);
      }
    }

    // ── PAYROLL ──
    if (action === "payroll") {
      if (method === "GET") {
        const { page, limit, offset } = parsePagination(url);
        const employeeId = url.searchParams.get("employee_id");
        const period = url.searchParams.get("period");
        const status = url.searchParams.get("status");

        let query = ctx.supabase
          .from("payroll_records")
          .select("*, employees(full_name, position)", { count: "exact" })
          .eq("tenant_id", ctx.tenantId)
          .order("period", { ascending: false })
          .range(offset, offset + limit - 1);

        if (employeeId) query = query.eq("employee_id", employeeId);
        if (period) query = query.eq("period", period);
        if (status) query = query.eq("status", status);

        const { data, count, error } = await query;
        if (error) throw error;
        return success(paginatedResponse(data || [], count, page, limit));
      }

      if (method === "POST") {
        if (denied) return denied;
        const body = await req.json();
        const v = validate(body)
          .required("employee_id")
          .required("period")
          .uuid("employee_id")
          .string("period", { min: 1, max: 20 })
          .number("base_salary", { min: 0 });

        if (!v.isValid()) return badRequest("Validation failed", v.getErrors());

        const baseSalary = body.base_salary || 0;
        const overtime = body.overtime || 0;
        const bonus = body.bonus || 0;
        const deductions = body.deductions || 0;
        const netPay = baseSalary + overtime + bonus - deductions;

        const { data, error } = await ctx.supabase
          .from("payroll_records")
          .insert({
            tenant_id: ctx.tenantId,
            employee_id: body.employee_id,
            period: body.period,
            base_salary: baseSalary,
            overtime,
            bonus,
            deductions,
            net_pay: netPay,
            status: "draft",
          })
          .select()
          .single();

        if (error) throw error;
        await writeAuditLog(ctx, "create", "payroll_record", data.id, null, data);
        return success(data, 201);
      }

      if (method === "PATCH") {
        if (denied) return denied;
        const id = url.searchParams.get("id");
        if (!id) return badRequest("id is required");

        const body = await req.json();
        const updates: Record<string, unknown> = {};
        const fields = ["base_salary", "overtime", "bonus", "deductions", "status"];
        for (const f of fields) {
          if (body[f] !== undefined) updates[f] = body[f];
        }

        // Recalculate net_pay
        if (body.base_salary !== undefined || body.overtime !== undefined || body.bonus !== undefined || body.deductions !== undefined) {
          const { data: current } = await ctx.supabase
            .from("payroll_records")
            .select("base_salary, overtime, bonus, deductions")
            .eq("id", id)
            .single();

          if (current) {
            const bs = body.base_salary ?? current.base_salary;
            const ot = body.overtime ?? current.overtime;
            const bn = body.bonus ?? current.bonus;
            const dd = body.deductions ?? current.deductions;
            updates.net_pay = bs + ot + bn - dd;
          }
        }

        if (body.status === "paid") {
          updates.paid_at = new Date().toISOString();
        }

        const { data, error } = await ctx.supabase
          .from("payroll_records")
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
