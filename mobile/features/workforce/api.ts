import { db } from "../../lib/db";

/* ── Shift Schedules ── */
export interface ShiftRow {
  id: string;
  tenant_id: string;
  staff_member_id: string;
  building_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  status: string;
  notes: string | null;
  created_at: string;
  // joined
  staff_name?: string;
  building_name?: string;
}

export async function fetchShifts(params: { week_start?: string; building_id?: string } = {}) {
  let query = db
    .from("shift_schedules")
    .select("*, staff_members!shift_schedules_staff_member_id_fkey(name), buildings!shift_schedules_building_id_fkey(name)")
    .order("shift_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(200);

  if (params.building_id) query = query.eq("building_id", params.building_id);
  if (params.week_start) query = query.gte("shift_date", params.week_start);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((d: any) => ({
    ...d,
    staff_name: d.staff_members?.name ?? null,
    building_name: d.buildings?.name ?? null,
    staff_members: undefined,
    buildings: undefined,
  })) as ShiftRow[];
}

/* ── Patrol Routes ── */
export interface PatrolRow {
  id: string;
  tenant_id: string;
  building_id: string;
  guard_id: string | null;
  status: string;
  start_time: string | null;
  end_time: string | null;
  completion: number;
  notes: string | null;
  created_at: string;
  // joined
  guard_name?: string;
  building_name?: string;
}

export interface CheckpointRow {
  id: string;
  route_id: string;
  name: string;
  sequence_order: number;
  completed: boolean;
  completed_at: string | null;
}

export async function fetchPatrols() {
  const { data, error } = await db
    .from("patrol_routes")
    .select("*, staff_members!patrol_routes_guard_id_fkey(name), buildings!patrol_routes_building_id_fkey(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []).map((d: any) => ({
    ...d,
    guard_name: d.staff_members?.name ?? null,
    building_name: d.buildings?.name ?? null,
    staff_members: undefined,
    buildings: undefined,
  })) as PatrolRow[];
}

export async function fetchCheckpoints(routeId: string) {
  const { data, error } = await db
    .from("patrol_checkpoints")
    .select("*")
    .eq("route_id", routeId)
    .order("sequence_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CheckpointRow[];
}

/* ── Staff Members (for GPS check-in) ── */
export interface StaffMemberRow {
  id: string;
  name: string;
  role: string;
  status: string;
  building_id: string | null;
  last_check_in: string | null;
  in_assigned_zone: boolean;
  zone: string | null;
  phone: string | null;
  building_name?: string;
}

export async function fetchStaffMembers() {
  const { data, error } = await db
    .from("staff_members")
    .select("*, buildings!staff_members_building_id_fkey(name)")
    .order("name", { ascending: true })
    .limit(200);

  if (error) throw error;
  return (data ?? []).map((d: any) => ({
    ...d,
    building_name: d.buildings?.name ?? null,
    buildings: undefined,
  })) as StaffMemberRow[];
}

/* ── Stats ── */
export async function fetchWorkforceStats() {
  const { data: staff } = await db
    .from("staff_members")
    .select("status", { count: "exact" });

  const total = staff?.length ?? 0;
  const online = staff?.filter((s) => s.status !== "offline").length ?? 0;
  const offline = total - online;

  const today = new Date().toISOString().split("T")[0];
  const { count: shiftCount } = await db
    .from("shift_schedules")
    .select("*", { count: "exact", head: true })
    .eq("shift_date", today);

  const { data: patrols } = await db
    .from("patrol_routes")
    .select("completion, status")
    .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  const patrolCount = patrols?.length ?? 0;
  const avgCompletion = patrolCount > 0
    ? Math.round(patrols!.reduce((s, p) => s + Number(p.completion), 0) / patrolCount)
    : 0;

  return { totalStaff: total, onlineStaff: online, offlineStaff: offline, todayShifts: shiftCount ?? 0, patrolCompletion: avgCompletion };
}

export type CreateShiftInput = {
  staff_member_id: string;
  building_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type?: string;
  notes?: string;
};

export async function createShift(input: CreateShiftInput) {
  const tenantId = (await db.rpc("get_user_tenant_id")).data as string;
  const { data, error } = await db
    .from("shift_schedules")
    .insert({ ...input, tenant_id: tenantId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteShift(id: string) {
  const { error } = await db.from("shift_schedules").delete().eq("id", id);
  if (error) throw error;
}

/* ── Staff CRUD ── */
export type StaffStatus = "on-patrol" | "stationary" | "offline";

export type CreateStaffInput = {
  name: string;
  role?: string;
  status?: StaffStatus;
  building_id?: string | null;
  phone?: string | null;
  employee_id?: string | null;
  zone?: string | null;
};

export async function createStaffMember(input: CreateStaffInput) {
  const tenantId = (await db.rpc("get_user_tenant_id")).data as string;
  const { data, error } = await db
    .from("staff_members")
    .insert({
      tenant_id: tenantId,
      name: input.name,
      role: input.role ?? "Bảo vệ",
      status: input.status ?? "offline",
      building_id: input.building_id ?? null,
      phone: input.phone ?? null,
      employee_id: input.employee_id ?? null,
      zone: input.zone ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateStaffMember(id: string, input: Partial<CreateStaffInput>) {
  const { data, error } = await db
    .from("staff_members")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStaffMember(id: string) {
  const { error } = await db.from("staff_members").delete().eq("id", id);
  if (error) throw error;
}

/* ── Patrol Routes CRUD ── */
export type CreatePatrolInput = {
  building_id: string;
  guard_id?: string | null;
  notes?: string | null;
  start_time?: string | null;
  status?: string;
};

export async function createPatrolRoute(input: CreatePatrolInput) {
  const tenantId = (await db.rpc("get_user_tenant_id")).data as string;
  const { data, error } = await db
    .from("patrol_routes")
    .insert({
      tenant_id: tenantId,
      building_id: input.building_id,
      guard_id: input.guard_id ?? null,
      notes: input.notes ?? null,
      start_time: input.start_time ?? new Date().toISOString(),
      status: (input.status as any) ?? "active",
      completion: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePatrolRoute(id: string, input: Partial<{ status: string; guard_id: string | null; notes: string | null; end_time: string | null; completion: number }>) {
  const { data, error } = await db.from("patrol_routes").update(input as any).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePatrolRoute(id: string) {
  await db.from("patrol_checkpoints").delete().eq("route_id", id);
  const { error } = await db.from("patrol_routes").delete().eq("id", id);
  if (error) throw error;
}

/* ── Checkpoints CRUD ── */
export async function createCheckpoint(input: { route_id: string; name: string; sequence_order?: number }) {
  const { data, error } = await db
    .from("patrol_checkpoints")
    .insert({
      route_id: input.route_id,
      name: input.name,
      sequence_order: input.sequence_order ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  await recalcRouteCompletion(input.route_id);
  return data;
}

export async function updateCheckpoint(id: string, input: Partial<{ name: string; sequence_order: number; completed: boolean }>) {
  const updates: any = { ...input };
  if (input.completed === true) updates.completed_at = new Date().toISOString();
  if (input.completed === false) updates.completed_at = null;
  const { data, error } = await db.from("patrol_checkpoints").update(updates).eq("id", id).select().single();
  if (error) throw error;
  if ("completed" in input && data?.route_id) await recalcRouteCompletion(data.route_id);
  return data;
}

export async function deleteCheckpoint(id: string, route_id: string) {
  const { error } = await db.from("patrol_checkpoints").delete().eq("id", id);
  if (error) throw error;
  await recalcRouteCompletion(route_id);
}

async function recalcRouteCompletion(routeId: string) {
  const { data: cps } = await db.from("patrol_checkpoints").select("completed").eq("route_id", routeId);
  if (!cps || cps.length === 0) {
    await db.from("patrol_routes").update({ completion: 0 }).eq("id", routeId);
    return;
  }
  const done = cps.filter((c: any) => c.completed).length;
  const completion = Math.round((done / cps.length) * 100);
  const updates: any = { completion };
  if (done === cps.length) {
    updates.status = "completed";
    updates.end_time = new Date().toISOString();
  }
  await db.from("patrol_routes").update(updates).eq("id", routeId);
}
