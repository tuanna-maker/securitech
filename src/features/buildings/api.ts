import { db } from "@/lib/db";

export interface BuildingRow {
  id: string;
  tenant_id: string;
  name: string;
  region: string | null;
  address: string | null;
  management_company: string | null;
  status: "normal" | "warning" | "critical";
  lat: number | null;
  lng: number | null;
  staff_online: number;
  staff_total: number;
  incidents_today: number;
  critical_incidents: number;
  patrol_completion: number;
  sla_percent: number;
  created_at: string;
  updated_at: string;
}

export interface BuildingListParams {
  page?: number;
  limit?: number;
  status?: string;
  region?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchBuildings(params: BuildingListParams = {}): Promise<PaginatedResponse<BuildingRow>> {
  const { page = 1, limit = 50, status, region, search } = params;
  const offset = (page - 1) * limit;

  let query = db
    .from("buildings")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (status && status !== "all") query = query.eq("status", status as "normal" | "warning" | "critical");
  if (region && region !== "all") query = query.eq("region", region);
  if (search) query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as BuildingRow[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function fetchBuildingById(id: string): Promise<BuildingRow | null> {
  const { data, error } = await db
    .from("buildings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as BuildingRow;
}

export interface CreateBuildingInput {
  name: string;
  address?: string;
  region?: string;
  management_company?: string;
  status?: "normal" | "warning" | "critical";
  lat?: number;
  lng?: number;
  staff_total?: number;
}

export async function createBuilding(input: CreateBuildingInput): Promise<BuildingRow> {
  const { data, error } = await db
    .from("buildings")
    .insert({
      name: input.name,
      address: input.address || null,
      region: input.region || null,
      management_company: input.management_company || null,
      status: input.status || "normal",
      lat: input.lat || null,
      lng: input.lng || null,
      staff_total: input.staff_total || 0,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as BuildingRow;
}

export async function updateBuilding(id: string, input: Partial<CreateBuildingInput>): Promise<BuildingRow> {
  const updates: Record<string, unknown> = {};
  const fields = ["name", "address", "region", "management_company", "status", "lat", "lng", "staff_total"];
  for (const f of fields) {
    if ((input as any)[f] !== undefined) updates[f] = (input as any)[f];
  }

  const { data, error } = await db
    .from("buildings")
    .update(updates as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as BuildingRow;
}

export async function deleteBuilding(id: string): Promise<void> {
  const { error } = await db
    .from("buildings")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
