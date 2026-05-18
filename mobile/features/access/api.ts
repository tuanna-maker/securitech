import { db } from "../../lib/db";

export interface AccessLogRow {
  id: string;
  tenant_id: string;
  building_id: string;
  visitor_name: string;
  visitor_type: string;
  phone: string | null;
  id_number: string | null;
  purpose: string | null;
  host_resident: string | null;
  vehicle_plate: string | null;
  photo_url: string | null;
  checked_in_at: string;
  checked_out_at: string | null;
  guard_id: string | null;
  temp_card_number: string | null;
  notes: string | null;
  created_at: string;
  building_name?: string;
}

export async function fetchAccessLogs(params: { building_id?: string; visitor_type?: string; search?: string } = {}) {
  let query = db
    .from("access_logs")
    .select("*, buildings!access_logs_building_id_fkey(name)")
    .order("checked_in_at", { ascending: false })
    .limit(100);

  if (params.building_id) query = query.eq("building_id", params.building_id);
  if (params.visitor_type && params.visitor_type !== "all") query = query.eq("visitor_type", params.visitor_type as any);
  if (params.search) query = query.or(`visitor_name.ilike.%${params.search}%,vehicle_plate.ilike.%${params.search}%`);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((d: any) => ({
    ...d,
    building_name: d.buildings?.name ?? null,
    buildings: undefined,
  })) as AccessLogRow[];
}

export async function createAccessLog(input: {
  building_id: string;
  visitor_name: string;
  visitor_type?: string;
  phone?: string;
  id_number?: string;
  purpose?: string;
  host_resident?: string;
  vehicle_plate?: string;
  notes?: string;
}) {
  const { data, error } = await db
    .from("access_logs")
    .insert({
      building_id: input.building_id,
      visitor_name: input.visitor_name,
      visitor_type: (input.visitor_type as any) || "guest",
      phone: input.phone || null,
      id_number: input.id_number || null,
      purpose: input.purpose || null,
      host_resident: input.host_resident || null,
      vehicle_plate: input.vehicle_plate || null,
      notes: input.notes || null,
    } as any)
    .select("*, buildings!access_logs_building_id_fkey(name)")
    .single();

  if (error) throw error;
  return { ...data, building_name: (data as any).buildings?.name ?? null } as AccessLogRow;
}

export async function checkoutVisitor(id: string) {
  const { data, error } = await db
    .from("access_logs")
    .update({ checked_out_at: new Date().toISOString() } as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as AccessLogRow;
}

export async function fetchAccessStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data } = await db
    .from("access_logs")
    .select("id, checked_out_at, visitor_type")
    .gte("checked_in_at", today.toISOString());

  const logs = data ?? [];
  const inside = logs.filter((l) => !l.checked_out_at).length;

  return {
    todayTotal: logs.length,
    currentlyInside: inside,
    exited: logs.length - inside,
  };
}
