import { db, type Database } from "@/lib/db";

type InvoiceInsert = Database["public"]["Tables"]["invoices"]["Insert"];
type InvoiceUpdate = Database["public"]["Tables"]["invoices"]["Update"];

// ── Invoices ──
export async function fetchInvoices(params: { status?: string; client_id?: string; page?: number; limit?: number } = {}) {
  const { status, client_id, page = 1, limit = 50 } = params;
  const offset = (page - 1) * limit;

  let query = db
    .from("invoices")
    .select("*, clients!invoices_client_id_fkey(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (client_id) query = query.eq("client_id", client_id);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

export async function createInvoice(body: InvoiceInsert) {
  const { data, error } = await db.from("invoices").insert(body).select().single();
  if (error) throw error;
  return data;
}

export async function updateInvoice(id: string, body: InvoiceUpdate) {
  const { data, error } = await db.from("invoices").update(body).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Payroll ──
export async function fetchPayrollRecords(params: { period?: string; status?: string } = {}) {
  let query = db
    .from("payroll_records")
    .select("*, employees!payroll_records_employee_id_fkey(full_name, position)", { count: "exact" })
    .order("period", { ascending: false });

  if (params.period) query = query.eq("period", params.period);
  if (params.status) query = query.eq("status", params.status);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

// ── Finance Stats ──
export async function fetchFinanceStats() {
  const [invoiceRes, payrollRes, overdueRes] = await Promise.all([
    db.from("invoices").select("amount, total, status"),
    db.from("payroll_records").select("net_pay, status"),
    db.from("invoices").select("id, total", { count: "exact" }).eq("status", "overdue"),
  ]);

  const invoices = invoiceRes.data || [];
  const payroll = payrollRes.data || [];

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);
  const totalPayroll = payroll.reduce((s, p) => s + Number(p.net_pay), 0);
  const overdueCount = overdueRes.count || 0;
  const overdueAmount = (overdueRes.data || []).reduce((s, i) => s + Number(i.total), 0);

  return { totalRevenue, totalPayroll, overdueCount, overdueAmount, margin: totalRevenue > 0 ? ((totalRevenue - totalPayroll) / totalRevenue * 100).toFixed(1) : "0" };
}
