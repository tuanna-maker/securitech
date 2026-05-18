import { db } from "@/lib/db";

export interface IncidentRow {
  id: string;
  tenant_id: string;
  building_id: string;
  reporter_id: string | null;
  assignee_id: string | null;
  severity: string;
  status: string;
  type: string;
  description: string | null;
  response_time_minutes: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  building_name?: string;
}

export interface IncidentTimelineRow {
  id: string;
  incident_id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  notes: string | null;
  performed_by: string | null;
  created_at: string;
  tenant_id: string;
}

export interface IncidentListParams {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
  building_id?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchIncidents(params: IncidentListParams = {}): Promise<PaginatedResponse<IncidentRow>> {
  const { page = 1, limit = 50, status, severity, building_id, search } = params;
  const offset = (page - 1) * limit;

  let query = db
    .from("incidents")
    .select("*, buildings!incidents_building_id_fkey(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== "all") query = query.eq("status", status as any);
  if (severity && severity !== "all") query = query.eq("severity", severity as any);
  if (building_id) query = query.eq("building_id", building_id);
  if (search) query = query.or(`type.ilike.%${search}%,description.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) throw error;

  const rows = (data ?? []).map((d: any) => ({
    ...d,
    building_name: d.buildings?.name ?? null,
    buildings: undefined,
  })) as IncidentRow[];

  return {
    data: rows,
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function fetchIncidentTimeline(incidentId: string): Promise<IncidentTimelineRow[]> {
  const { data, error } = await db
    .from("incident_timeline")
    .select("*")
    .eq("incident_id", incidentId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as IncidentTimelineRow[];
}

export interface CreateIncidentInput {
  building_id: string;
  type: string;
  description?: string;
  severity?: "low" | "medium" | "high" | "critical";
}

export async function createIncident(input: CreateIncidentInput): Promise<IncidentRow> {
  const { data, error } = await db
    .from("incidents")
    .insert({
      building_id: input.building_id,
      type: input.type,
      description: input.description || null,
      severity: input.severity || "medium",
    } as any)
    .select("*, buildings!incidents_building_id_fkey(name)")
    .single();

  if (error) throw error;
  return { ...data, building_name: (data as any).buildings?.name ?? null } as IncidentRow;
}

export async function updateIncidentStatus(id: string, status: string): Promise<IncidentRow> {
  const updates: Record<string, unknown> = { status };
  if (status === "resolved") updates.resolved_at = new Date().toISOString();

  const { data, error } = await db
    .from("incidents")
    .update(updates as any)
    .eq("id", id)
    .select("*, buildings!incidents_building_id_fkey(name)")
    .single();

  if (error) throw error;
  return { ...data, building_name: (data as any).buildings?.name ?? null } as IncidentRow;
}

export async function deleteIncident(id: string): Promise<void> {
  const { error } = await db.from("incidents").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchIncidentStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayData } = await db
    .from("incidents")
    .select("id, severity, status", { count: "exact" })
    .gte("created_at", today.toISOString());

  const { count: monthCount } = await db
    .from("incidents")
    .select("*", { count: "exact", head: true })
    .eq("status", "resolved")
    .gte("created_at", new Date(today.getFullYear(), today.getMonth(), 1).toISOString());

  const { data: avgData } = await db
    .from("incidents")
    .select("response_time_minutes")
    .not("response_time_minutes", "is", null)
    .gte("created_at", new Date(today.getFullYear(), today.getMonth(), 1).toISOString());

  const todayIncidents = todayData ?? [];
  const activeCount = todayIncidents.filter((i) => !["resolved", "closed"].includes(i.status)).length;
  const highCount = todayIncidents.filter((i) => ["high", "critical"].includes(i.severity)).length;

  const avgResponse = avgData && avgData.length > 0
    ? Math.round(avgData.reduce((sum, i) => sum + (i.response_time_minutes ?? 0), 0) / avgData.length)
    : 0;

  return {
    todayCount: todayIncidents.length,
    activeCount,
    highCount,
    avgResponseMinutes: avgResponse,
    resolvedMonth: monthCount ?? 0,
  };
}
