export type BuildingStatus = "normal" | "warning" | "critical";
export type StaffStatus = "on-patrol" | "stationary" | "offline";
export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "new" | "processing" | "resolved";

export interface Building {
  id: string;
  name: string;
  region: string;
  managementCompany: string;
  status: BuildingStatus;
  lat: number;
  lng: number;
  staffOnline: number;
  staffTotal: number;
  incidentsToday: number;
  criticalIncidents: number;
  patrolCompletion: number;
  slaPercent: number;
  address: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  buildingId: string;
  status: StaffStatus;
  zone: string;
  lastCheckIn: string;
  inAssignedZone: boolean;
}

export interface Incident {
  id: string;
  buildingId: string;
  buildingName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  type: string;
  description: string;
  timestamp: string;
  assignee: string;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  buildingName: string;
  buildingId: string;
  type: "critical" | "warning" | "info" | "success";
  icon: string;
  description: string;
}

export interface PatrolCheckpoint {
  id: string;
  name: string;
  completed: boolean;
  time?: string;
}

export interface ActivityEvent {
  time: string;
  text: string;
  type: "danger" | "warning" | "info" | "success";
}

const regions = ["Quận 1", "Quận 2", "Quận 7", "Quận 9", "Bình Thạnh", "Thủ Đức", "Tân Bình", "Phú Nhuận", "Gò Vấp", "Hà Đông", "Cầu Giấy", "Long Biên", "Hoàng Mai", "Nam Từ Liêm", "Thanh Xuân"];
const companies = ["VinGroup", "Novaland", "CapitaLand", "Gamuda Land", "Phú Mỹ Hưng", "Masterise", "Sunshine Group", "Ecopark"];

const buildingNames = [
  "Vinhomes Central Park", "Vinhomes Grand Park", "Vinhomes Ocean Park", "Vinhomes Smart City",
  "Vinhomes Golden River", "Masteri Thảo Điền", "Masteri An Phú", "Masteri Centre Point",
  "The Manor", "The Vista", "Estella Heights", "Diamond Island",
  "Sunrise City", "Sunrise Riverside", "Saigon Pearl", "River Gate",
  "Galaxy 9", "The Tresor", "Millennium", "Kingdom 101",
  "Gamuda Gardens", "Gamuda City", "Gamuda The Zen", "Ecopark Sky Oasis",
  "Ecopark West Bay", "Sunshine Diamond River", "Sunshine City Sài Gòn",
  "Landmark 81", "Times City", "Royal City", "Park Hill Premium",
  "Mipec Riverside", "Imperia Sky Garden", "Goldmark City", "Sun Grand City",
  "Green Bay Tower", "Aqua Bay", "Sky Central", "Eco Green City",
  "TNR The Nosta", "Amber Riverside", "Sapphire Palace", "Ruby Tower",
  "Emerald Bay",
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBuildings(): Building[] {
  return buildingNames.map((name, i) => {
    const criticalIncidents = i < 3 ? rand(1, 3) : i < 8 ? rand(0, 1) : 0;
    const incidentsToday = criticalIncidents + rand(0, 5);
    const sla = criticalIncidents > 0 ? rand(72, 89) : i < 8 ? rand(85, 94) : rand(92, 99);
    const status: BuildingStatus = criticalIncidents > 0 ? "critical" : sla < 90 ? "warning" : "normal";
    const staffTotal = rand(10, 24);
    const staffOnline = status === "critical" ? Math.max(rand(staffTotal - 5, staffTotal - 2), 1) : rand(staffTotal - 3, staffTotal);

    return {
      id: `BLD-${String(i + 1).padStart(3, "0")}`,
      name,
      region: pick(regions),
      managementCompany: pick(companies),
      status,
      lat: 10.76 + (Math.random() - 0.5) * 0.15,
      lng: 106.66 + (Math.random() - 0.5) * 0.15,
      staffOnline: Math.min(staffOnline, staffTotal),
      staffTotal,
      incidentsToday,
      criticalIncidents,
      patrolCompletion: status === "critical" ? rand(55, 78) : status === "warning" ? rand(70, 88) : rand(85, 100),
      slaPercent: sla,
      address: `${rand(1, 999)} ${pick(["Nguyễn Huệ", "Lê Lợi", "Hai Bà Trưng", "Võ Văn Tần", "Điện Biên Phủ", "Nguyễn Văn Linh", "Phạm Hùng", "Lê Văn Lương"])}`,
    };
  });
}

const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Vũ", "Đặng", "Bùi", "Đỗ"];
const middleNames = ["Văn", "Thị", "Minh", "Quốc", "Đức", "Thanh", "Ngọc", "Hữu"];
const lastNames = ["An", "Bình", "Cường", "Dũng", "Hùng", "Khoa", "Long", "Nam", "Phúc", "Quang", "Sơn", "Tâm", "Tuấn", "Việt"];

function generateStaff(buildings: Building[]): StaffMember[] {
  const staff: StaffMember[] = [];
  const roles = ["Bảo vệ Trưởng", "Bảo vệ", "Giám sát", "Kỹ thuật viên"];
  const zones = ["Cổng chính", "Tầng hầm B1", "Tầng hầm B2", "Sảnh", "Khu vực bãi xe", "Tầng thượng", "Khu thương mại"];

  buildings.forEach((b) => {
    for (let i = 0; i < b.staffTotal; i++) {
      const isOnline = i < b.staffOnline;
      const statuses: StaffStatus[] = isOnline ? ["on-patrol", "stationary"] : ["offline"];
      staff.push({
        id: `STF-${b.id}-${String(i + 1).padStart(2, "0")}`,
        name: `${pick(firstNames)} ${pick(middleNames)} ${pick(lastNames)}`,
        role: i === 0 ? "Bảo vệ Trưởng" : pick(roles),
        buildingId: b.id,
        status: pick(statuses),
        zone: pick(zones),
        lastCheckIn: `${rand(0, 23).toString().padStart(2, "0")}:${rand(0, 59).toString().padStart(2, "0")}`,
        inAssignedZone: Math.random() > 0.1,
      });
    }
  });
  return staff;
}

const alertTypes = [
  { type: "critical" as const, icon: "🔴", descriptions: ["Báo cháy kích hoạt — Tầng hầm", "Xâm nhập trái phép — Khu vực cấm", "Mất điện toàn bộ tòa nhà", "Đánh nhau tại sảnh chính"] },
  { type: "warning" as const, icon: "🟡", descriptions: ["Bỏ lỡ checkpoint tuần tra", "Camera mất tín hiệu", "Nhân viên rời khỏi vùng phân công", "Cửa thoát hiểm bị chặn", "Vắng ca không báo trước"] },
  { type: "info" as const, icon: "🔵", descriptions: ["Khách lạ đăng ký ra vào", "Yêu cầu hỗ trợ kỹ thuật", "Cư dân khiếu nại tiếng ồn", "Xe đỗ sai quy định"] },
  { type: "success" as const, icon: "🟢", descriptions: ["Tuần tra hoàn thành đúng hạn", "Sự cố đã được xử lý", "Ca trực chuyển giao thành công", "Kiểm tra PCCC hoàn tất"] },
];

function generateAlerts(buildings: Building[]): AlertItem[] {
  const alerts: AlertItem[] = [];
  for (let i = 0; i < 30; i++) {
    const b = pick(buildings);
    const at = pick(alertTypes);
    const h = rand(6, 23);
    const m = rand(0, 59);
    alerts.push({
      id: `ALT-${String(i + 1).padStart(3, "0")}`,
      timestamp: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
      buildingName: b.name,
      buildingId: b.id,
      type: at.type,
      icon: at.icon,
      description: pick(at.descriptions),
    });
  }
  return alerts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

function generateIncidents(buildings: Building[]): Incident[] {
  const incidents: Incident[] = [];
  const types = ["An ninh", "Cháy nổ", "Thiết bị", "Nhân sự", "Khiếu nại", "Vi phạm nội quy"];
  const descs: Record<string, string[]> = {
    "An ninh": ["Người lạ xâm nhập", "Trộm cắp tài sản", "Đánh nhau"],
    "Cháy nổ": ["Báo cháy tầng hầm", "Rò rỉ gas", "Cháy phòng rác"],
    "Thiết bị": ["Camera hỏng", "Thang máy trục trặc", "Mất điện"],
    "Nhân sự": ["Vắng ca", "Ngủ gật khi trực", "Rời vị trí"],
    "Khiếu nại": ["Tiếng ồn", "Rò rỉ nước", "Mùi hôi"],
    "Vi phạm nội quy": ["Đỗ xe sai", "Nuôi thú cưng", "Tụ tập đông người"],
  };

  let idx = 0;
  buildings.forEach((b) => {
    for (let i = 0; i < b.incidentsToday; i++) {
      const type = pick(types);
      const sev: IncidentSeverity = i < b.criticalIncidents ? "critical" : pick(["high", "medium", "low"]);
      incidents.push({
        id: `INC-${String(++idx).padStart(4, "0")}`,
        buildingId: b.id,
        buildingName: b.name,
        severity: sev,
        status: pick(["new", "processing", "resolved"]),
        type,
        description: pick(descs[type]),
        timestamp: `${rand(6, 23).toString().padStart(2, "0")}:${rand(0, 59).toString().padStart(2, "0")}`,
        assignee: `${pick(firstNames)} ${pick(middleNames)} ${pick(lastNames)}`,
      });
    }
  });
  return incidents.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// Generate and export static data
export const buildings = generateBuildings();
export const allStaff = generateStaff(buildings);
export const alerts = generateAlerts(buildings);
export const allIncidents = generateIncidents(buildings);

// Computed stats
export const totalStaffOnline = allStaff.filter((s) => s.status !== "offline").length;
export const totalStaff = allStaff.length;
export const staffOnPatrol = allStaff.filter((s) => s.status === "on-patrol").length;
export const staffStationary = allStaff.filter((s) => s.status === "stationary").length;
export const staffOffline = allStaff.filter((s) => s.status === "offline").length;
export const totalIncidentsToday = buildings.reduce((s, b) => s + b.incidentsToday, 0);
export const totalCriticalIncidents = buildings.reduce((s, b) => s + b.criticalIncidents, 0);
export const avgSla = Math.round(buildings.reduce((s, b) => s + b.slaPercent, 0) / buildings.length);

export const understaffedBuildings = buildings.filter((b) => b.staffOnline / b.staffTotal < 0.7);
export const outOfZoneStaff = allStaff.filter((s) => !s.inAssignedZone && s.status !== "offline");

// Performance data for charts
export const incidentTrendData = Array.from({ length: 14 }, (_, i) => ({
  day: `${15 + i}/3`,
  incidents: rand(8, 35),
  resolved: rand(6, 30),
}));

export const slaTrendData = Array.from({ length: 14 }, (_, i) => ({
  day: `${15 + i}/3`,
  sla: rand(88, 98),
}));

export const patrolTrendData = Array.from({ length: 14 }, (_, i) => ({
  day: `${15 + i}/3`,
  completion: rand(82, 99),
}));

export const worstBuildings = [...buildings].sort((a, b) => a.slaPercent - b.slaPercent).slice(0, 5);
