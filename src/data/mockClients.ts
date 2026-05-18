import { buildings, type Building } from "./mockBuildings";

export type ClientStatus = "active" | "negotiating" | "prospect" | "churned";
export type ContractStatus = "active" | "expiring" | "expired" | "draft";

export interface Client {
  id: string;
  name: string;
  type: "bql" | "owner";
  contact: string;
  phone: string;
  email: string;
  buildings: string[]; // building display names (legacy)
  buildingIds: string[]; // linked building IDs from mockBuildings
  status: ClientStatus;
  contractValue: number;
  contractStart: string;
  contractEnd: string;
  contractStatus: ContractStatus;
  guards: number;
  sla: number;
  satisfaction: number;
  notes: string;
  lastContact: string;
}

/** Match buildings by partial name */
function findBuildingIds(names: string[]): string[] {
  const ids: string[] = [];
  for (const name of names) {
    const base = name.replace(/ - .+$/, "").trim().toLowerCase();
    for (const b of buildings) {
      if (b.name.toLowerCase().includes(base) || base.includes(b.name.toLowerCase())) {
        if (!ids.includes(b.id)) ids.push(b.id);
      }
    }
  }
  return ids;
}

const rawClients: Omit<Client, "buildingIds">[] = [
  {
    id: "C001", name: "BQL Vinhomes Central Park", type: "bql",
    contact: "Ông Trần Minh Đức", phone: "0901 234 567", email: "duc.tran@vinhomes.vn",
    buildings: ["Vinhomes Central Park - Tower 1", "Vinhomes Central Park - Tower 2", "Vinhomes Central Park - Tower 3"],
    status: "active", contractValue: 450, contractStart: "01/01/2024", contractEnd: "31/12/2025",
    contractStatus: "active", guards: 42, sla: 97.2, satisfaction: 5, notes: "Khách hàng VIP, hợp đồng dài hạn", lastContact: "02/04/2026",
  },
  {
    id: "C002", name: "BQL Royal City", type: "bql",
    contact: "Bà Nguyễn Thị Hương", phone: "0912 345 678", email: "huong.nguyen@royalcity.vn",
    buildings: ["Royal City - Tòa R1", "Royal City - Tòa R2"],
    status: "active", contractValue: 280, contractStart: "01/06/2024", contractEnd: "31/05/2025",
    contractStatus: "expiring", guards: 28, sla: 94.8, satisfaction: 4, notes: "Hợp đồng sắp hết hạn, cần gia hạn", lastContact: "28/03/2026",
  },
  {
    id: "C003", name: "Chủ đầu tư Gamuda Land", type: "owner",
    contact: "Ông Lê Văn Thành", phone: "0923 456 789", email: "thanh.le@gamuda.vn",
    buildings: ["Gamuda Gardens - Khu A", "Gamuda Gardens - Khu B", "Gamuda City"],
    status: "active", contractValue: 520, contractStart: "01/03/2024", contractEnd: "28/02/2026",
    contractStatus: "active", guards: 56, sla: 96.1, satisfaction: 4, notes: "Dự án lớn, cần giám sát chặt", lastContact: "01/04/2026",
  },
  {
    id: "C004", name: "BQL Masteri Thảo Điền", type: "bql",
    contact: "Ông Phạm Hoàng Nam", phone: "0934 567 890", email: "nam.pham@masteri.vn",
    buildings: ["Masteri Thảo Điền - T1", "Masteri Thảo Điền - T2"],
    status: "active", contractValue: 195, contractStart: "01/09/2024", contractEnd: "31/08/2025",
    contractStatus: "active", guards: 18, sla: 95.5, satisfaction: 4, notes: "", lastContact: "25/03/2026",
  },
  {
    id: "C005", name: "BQL Sunshine City", type: "bql",
    contact: "Bà Đỗ Thu Trang", phone: "0945 678 901", email: "trang.do@sunshine.vn",
    buildings: ["Sunshine City - S1", "Sunshine City - S2", "Sunshine City - S3"],
    status: "negotiating", contractValue: 380, contractStart: "", contractEnd: "",
    contractStatus: "draft", guards: 0, sla: 0, satisfaction: 0, notes: "Đang đàm phán hợp đồng mới", lastContact: "03/04/2026",
  },
  {
    id: "C006", name: "Chủ đầu tư Ecopark", type: "owner",
    contact: "Ông Vũ Quốc Anh", phone: "0956 789 012", email: "anh.vu@ecopark.vn",
    buildings: ["Ecopark - Khu Aqua Bay", "Ecopark - Khu Rừng Cọ", "Ecopark - Grand Park", "Ecopark - West Bay"],
    status: "active", contractValue: 680, contractStart: "01/01/2024", contractEnd: "31/12/2025",
    contractStatus: "active", guards: 72, sla: 97.8, satisfaction: 5, notes: "Khách hàng lớn nhất, 4 khu vực", lastContact: "04/04/2026",
  },
  {
    id: "C007", name: "BQL Times City", type: "bql",
    contact: "Ông Hoàng Văn Minh", phone: "0967 890 123", email: "minh.hoang@timescity.vn",
    buildings: ["Times City - Park Hill", "Times City - T18"],
    status: "active", contractValue: 310, contractStart: "01/04/2024", contractEnd: "31/03/2025",
    contractStatus: "expired", guards: 32, sla: 93.2, satisfaction: 3, notes: "Hợp đồng đã hết hạn, đang chờ gia hạn", lastContact: "15/03/2026",
  },
  {
    id: "C008", name: "BQL Landmark 81", type: "bql",
    contact: "Bà Trần Thanh Thảo", phone: "0978 901 234", email: "thao.tran@landmark81.vn",
    buildings: ["Landmark 81"],
    status: "active", contractValue: 220, contractStart: "01/07/2024", contractEnd: "30/06/2026",
    contractStatus: "active", guards: 24, sla: 98.1, satisfaction: 5, notes: "Tòa nhà biểu tượng, yêu cầu cao", lastContact: "30/03/2026",
  },
  {
    id: "C009", name: "Chủ đầu tư Sun Group", type: "owner",
    contact: "Ông Nguyễn Đình Khoa", phone: "0989 012 345", email: "khoa.nguyen@sungroup.vn",
    buildings: [],
    status: "prospect", contractValue: 0, contractStart: "", contractEnd: "",
    contractStatus: "draft", guards: 0, sla: 0, satisfaction: 0, notes: "Tiềm năng lớn, 5 dự án tại Hà Nội", lastContact: "20/03/2026",
  },
  {
    id: "C010", name: "BQL The Manor", type: "bql",
    contact: "Ông Phan Thanh Bình", phone: "0990 123 456", email: "binh.phan@themanor.vn",
    buildings: ["The Manor - Tower A"],
    status: "churned", contractValue: 0, contractStart: "01/01/2024", contractEnd: "31/12/2024",
    contractStatus: "expired", guards: 0, sla: 0, satisfaction: 2, notes: "Đã chấm dứt HĐ do giá không cạnh tranh", lastContact: "10/01/2025",
  },
];

export const clients: Client[] = rawClients.map((c) => ({
  ...c,
  buildingIds: findBuildingIds(c.buildings),
}));

/** Find the client managing a specific building */
export function getClientForBuilding(buildingId: string): Client | undefined {
  return clients.find((c) => c.buildingIds.includes(buildingId));
}

/** Get linked Building objects for a client */
export function getBuildingsForClient(clientId: string): Building[] {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return [];
  return buildings.filter((b) => client.buildingIds.includes(b.id));
}

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

export interface PipelineDeal {
  name: string;
  value: number;
  stage: string;
  probability: number;
  contact: string;
  daysInStage: number;
}

export const pipelineDeals: PipelineDeal[] = [
  { name: "Sun Group - 5 dự án HN", value: 1200, stage: "lead", probability: 10, contact: "Nguyễn Đình Khoa", daysInStage: 15 },
  { name: "Sunshine City - 3 tòa", value: 380, stage: "negotiation", probability: 70, contact: "Đỗ Thu Trang", daysInStage: 8 },
  { name: "Vinpearl Nha Trang", value: 250, stage: "meeting", probability: 25, contact: "Trần Văn Hải", daysInStage: 5 },
  { name: "FLC Sầm Sơn", value: 180, stage: "proposal", probability: 40, contact: "Lê Thị Nga", daysInStage: 12 },
  { name: "Ciputra Hanoi - Phase 2", value: 420, stage: "proposal", probability: 50, contact: "Nguyễn Minh Tú", daysInStage: 7 },
  { name: "BRG Smart City", value: 550, stage: "meeting", probability: 20, contact: "Phạm Đức Long", daysInStage: 3 },
  { name: "Times City - Gia hạn", value: 310, stage: "negotiation", probability: 85, contact: "Hoàng Văn Minh", daysInStage: 20 },
];
