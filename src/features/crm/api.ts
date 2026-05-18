import { db } from "@/lib/db";

export type ClientStatus = "active" | "negotiating" | "prospect" | "churned";
export type ContractStatus = "active" | "expiring" | "expired" | "draft";

export const clientStatusConfig: Record<ClientStatus, { label: string; color: "teal" | "amber" | "info" | "danger" }> = {
  active: { label: "Đang hợp tác", color: "teal" },
  negotiating: { label: "Đang đàm phán", color: "amber" },
  prospect: { label: "Tiềm năng", color: "info" },
  churned: { label: "Đã rời", color: "danger" },
};

export const contractStatusConfig: Record<ContractStatus, { label: string; color: "teal" | "amber" | "danger" | "info" }> = {
  active: { label: "Đang hiệu lực", color: "teal" },
  expiring: { label: "Sắp hết hạn", color: "amber" },
  expired: { label: "Đã hết hạn", color: "danger" },
  draft: { label: "Bản nháp", color: "info" },
};

export const typeLabel: Record<string, string> = { bql: "Ban quản lý", owner: "Chủ đầu tư" };

export const pipelineStages = [
  { id: "lead", label: "Tiếp cận", color: "bg-info" },
  { id: "meeting", label: "Gặp mặt", color: "bg-purple" },
  { id: "proposal", label: "Gửi báo giá", color: "bg-amber" },
  { id: "negotiation", label: "Đàm phán", color: "bg-teal" },
  { id: "closed", label: "Chốt HĐ", color: "bg-teal" },
];

export async function fetchClients(params: { status?: string; type?: string } = {}) {
  let query = db
    .from("clients")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status as any);
  }
  if (params.type && params.type !== "all") {
    query = query.eq("type", params.type);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data || [], total: count || 0 };
}

export async function fetchClientBuildings(clientId: string) {
  const { data, error } = await db
    .from("client_buildings")
    .select("building_id, buildings!client_buildings_building_id_fkey(id, name, status, sla_percent, staff_online, staff_total, incidents_today, region, address)")
    .eq("client_id", clientId);

  if (error) throw error;
  return (data || []).map((row: any) => row.buildings).filter(Boolean);
}

export async function fetchPipelineDeals() {
  const { data, error } = await db
    .from("pipeline_deals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchClientStats() {
  const { data: allClients, error } = await db
    .from("clients")
    .select("status, contract_value, guards_count, satisfaction, contract_status");

  if (error) throw error;
  const clients = allClients || [];
  const active = clients.filter((c) => c.status === "active");
  const totalValue = active.reduce((s, c) => s + (c.contract_value || 0), 0);
  const totalGuards = active.reduce((s, c) => s + (c.guards_count || 0), 0);
  const withSat = active.filter((c) => c.satisfaction > 0);
  const avgSat = withSat.length > 0 ? withSat.reduce((s, c) => s + c.satisfaction, 0) / withSat.length : 0;

  return {
    total: clients.length,
    active: active.length,
    totalValue,
    totalGuards,
    avgSatisfaction: avgSat,
    byStatus: {
      active: active.length,
      negotiating: clients.filter((c) => c.status === "negotiating").length,
      prospect: clients.filter((c) => c.status === "prospect").length,
      churned: clients.filter((c) => c.status === "churned").length,
    },
  };
}

export type CreateClientInput = {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  type?: string;
  status?: ClientStatus;
  contract_value?: number;
  guards_count?: number;
  notes?: string;
};

export async function createClient(input: CreateClientInput) {
  const { data, error } = await db
    .from("clients")
    .insert({
      ...input,
      tenant_id: (await db.rpc("get_user_tenant_id")).data as string,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClient(id: string, input: Partial<CreateClientInput>) {
  const { data, error } = await db
    .from("clients")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClient(id: string) {
  const { error } = await db.from("clients").delete().eq("id", id);
  if (error) throw error;
}
