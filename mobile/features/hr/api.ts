import { db, type Database } from "../../lib/db";

type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"];
type EmployeeUpdate = Database["public"]["Tables"]["employees"]["Update"];
type LeaveUpdate = Database["public"]["Tables"]["leave_requests"]["Update"];
type EmployeeStatus = Database["public"]["Enums"]["employee_status"];

export interface EmployeeListParams {
  status?: string;
  building_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function fetchEmployees(params: EmployeeListParams = {}) {
  const { status, building_id, search, page = 1, limit = 50 } = params;
  const offset = (page - 1) * limit;

  let query = db
    .from("employees")
    .select("*, buildings!employees_building_id_fkey(name)", { count: "exact" })
    .order("full_name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status as EmployeeStatus);
  if (building_id) query = query.eq("building_id", building_id);
  if (search) query = query.or(`full_name.ilike.%${search}%,position.ilike.%${search}%,id_number.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

export async function createEmployee(body: EmployeeInsert) {
  const { data, error } = await db.from("employees").insert(body).select().single();
  if (error) throw error;
  return data;
}

export async function updateEmployee(id: string, body: EmployeeUpdate) {
  const { data, error } = await db.from("employees").update(body).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEmployee(id: string) {
  const { error } = await db.from("employees").delete().eq("id", id);
  if (error) throw error;
}

// ── Certifications ──
export async function fetchCertifications(params: { employee_id?: string } = {}) {
  let query = db.from("certifications").select("*, employees!certifications_employee_id_fkey(full_name)").order("expiry_date", { ascending: true });
  if (params.employee_id) query = query.eq("employee_id", params.employee_id);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ── Leave Requests ──
export async function fetchLeaveRequests(params: { status?: string } = {}) {
  let query = db.from("leave_requests").select("*, employees!leave_requests_employee_id_fkey(full_name, position)").order("created_at", { ascending: false });
  if (params.status) query = query.eq("status", params.status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateLeaveRequest(id: string, body: LeaveUpdate) {
  const { data, error } = await db.from("leave_requests").update(body).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── HR Stats ──
export async function fetchHRStats() {
  const [empRes, certRes, leaveRes] = await Promise.all([
    db.from("employees").select("status", { count: "exact" }),
    db.from("certifications").select("expiry_date").lt("expiry_date", new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]),
    db.from("leave_requests").select("id", { count: "exact" }).eq("status", "pending"),
  ]);

  const employees = empRes.data || [];
  const totalEmployees = empRes.count || 0;
  const probation = employees.filter(e => e.status === "probation").length;
  const expiringCerts = certRes.data?.length || 0;
  const pendingLeaves = leaveRes.count || 0;

  return { totalEmployees, probation, expiringCerts, pendingLeaves };
}
