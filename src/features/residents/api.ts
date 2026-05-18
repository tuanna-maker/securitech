import { db, type Database } from "@/lib/db";

type ResidentInsert = Database["public"]["Tables"]["residents"]["Insert"];
type ResidentUpdate = Database["public"]["Tables"]["residents"]["Update"];
type ParcelUpdate = Database["public"]["Tables"]["parcels"]["Update"];
type ParcelStatus = Database["public"]["Enums"]["parcel_status"];
type RequestStatus = Database["public"]["Enums"]["request_status"];
type RequestPriority = Database["public"]["Enums"]["request_priority"];
type ContractorStatus = Database["public"]["Enums"]["contractor_status"];
type SosStatus = Database["public"]["Enums"]["sos_status"];
type SupportRequestUpdate = Database["public"]["Tables"]["support_requests"]["Update"];

// ── Residents ──
export async function fetchResidents(params: { building_id?: string; status?: string; search?: string; is_elderly?: boolean; is_child?: boolean } = {}) {
  let query = db
    .from("residents")
    .select("*, buildings!residents_building_id_fkey(name)", { count: "exact" })
    .order("full_name", { ascending: true });

  if (params.building_id) query = query.eq("building_id", params.building_id);
  if (params.status) query = query.eq("status", params.status);
  if (params.is_elderly) query = query.eq("is_elderly", true);
  if (params.is_child) query = query.eq("is_child_household", true);
  if (params.search) query = query.or(`full_name.ilike.%${params.search}%,apartment.ilike.%${params.search}%,phone.ilike.%${params.search}%`);

  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

export async function createResident(body: ResidentInsert) {
  const { data, error } = await db.from("residents").insert(body).select().single();
  if (error) throw error;
  return data;
}

export async function updateResident(id: string, body: ResidentUpdate) {
  const { data, error } = await db.from("residents").update(body).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteResident(id: string) {
  const { error } = await db.from("residents").delete().eq("id", id);
  if (error) throw error;
}

// ── Parcels ──
export async function fetchParcels(params: { status?: string; building_id?: string } = {}) {
  let query = db
    .from("parcels")
    .select("*, buildings!parcels_building_id_fkey(name), residents!parcels_resident_id_fkey(full_name, apartment)")
    .order("received_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status as ParcelStatus);
  if (params.building_id) query = query.eq("building_id", params.building_id);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateParcel(id: string, body: ParcelUpdate) {
  const { data, error } = await db.from("parcels").update(body).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Support Requests ──
export async function fetchSupportRequests(params: { status?: string; priority?: string } = {}) {
  let query = db
    .from("support_requests")
    .select("*, buildings!support_requests_building_id_fkey(name), residents!support_requests_resident_id_fkey(full_name, apartment)")
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status as RequestStatus);
  if (params.priority) query = query.eq("priority", params.priority as RequestPriority);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateSupportRequest(id: string, body: SupportRequestUpdate) {
  const { data, error } = await db.from("support_requests").update(body).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Contractors ──
export async function fetchContractors(params: { status?: string } = {}) {
  let query = db
    .from("contractors")
    .select("*, buildings!contractors_building_id_fkey(name)")
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status as ContractorStatus);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ── Quick Services ──
export async function fetchQuickServices(params: { status?: string } = {}) {
  let query = db
    .from("quick_service_requests")
    .select("*, buildings!quick_service_requests_building_id_fkey(name), residents!quick_service_requests_resident_id_fkey(full_name, apartment)")
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status as RequestStatus);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ── SOS Calls ──
export async function fetchSOSCalls(params: { status?: string } = {}) {
  let query = db
    .from("sos_calls")
    .select("*, buildings!sos_calls_building_id_fkey(name), staff_members!sos_calls_dispatched_guard_id_fkey(name)")
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status as SosStatus);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateSOSCall(id: string, input: Partial<{ status: string; dispatched_guard_id: string | null; notes: string }>) {
  const updates: any = { ...input };
  if (input.status === "resolved") {
    updates.resolved_at = new Date().toISOString();
    const { data: orig } = await db.from("sos_calls").select("created_at").eq("id", id).single();
    if (orig?.created_at) {
      updates.response_time_seconds = Math.round((Date.now() - new Date(orig.created_at).getTime()) / 1000);
    }
  }
  const { data, error } = await db.from("sos_calls").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// ── Resident Services Stats ──
export async function fetchResidentServiceStats() {
  const [parcelsRes, requestsRes, contractorsRes] = await Promise.all([
    db.from("parcels").select("status", { count: "exact" }).in("status", ["received" as ParcelStatus, "notified" as ParcelStatus]),
    db.from("support_requests").select("status, priority", { count: "exact" }).in("status", ["open" as RequestStatus, "in_progress" as RequestStatus]),
    db.from("contractors").select("status, id", { count: "exact" }).eq("status", "active" as ContractorStatus),
  ]);

  const pendingParcels = parcelsRes.count || 0;
  const openRequests = requestsRes.count || 0;
  const highPriorityRequests = (requestsRes.data || []).filter(r => r.priority === "high").length;
  const activeContractors = contractorsRes.count || 0;

  return { pendingParcels, openRequests, highPriorityRequests, activeContractors };
}
