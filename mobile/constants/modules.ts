export type ModuleId =
  | "dashboard"
  | "buildings"
  | "security-staff"
  | "workforce"
  | "patrols"
  | "sos"
  | "access-control"
  | "incidents"
  | "resident-services"
  | "crm"
  | "reports"
  | "hr"
  | "finance"
  | "training"
  | "comms";

export const MODULES: { id: ModuleId; label: string; group: string }[] = [
  { id: "dashboard", label: "Tổng quan", group: "Vận hành" },
  { id: "buildings", label: "Tòa nhà / Chung cư", group: "Vận hành" },
  { id: "security-staff", label: "Nhân sự bảo vệ", group: "Vận hành" },
  { id: "workforce", label: "Ca trực & Tuần tra", group: "Vận hành" },
  { id: "patrols", label: "Tuần tra & Checkpoint", group: "Vận hành" },
  { id: "sos", label: "SOS khẩn cấp", group: "Vận hành" },
  { id: "access-control", label: "Kiểm soát ra/vào", group: "Vận hành" },
  { id: "incidents", label: "Sự cố", group: "Vận hành" },
  { id: "resident-services", label: "Dịch vụ cư dân", group: "Vận hành" },
  { id: "crm", label: "Khách hàng (CRM)", group: "Vận hành" },
  { id: "reports", label: "Báo cáo tổng hợp", group: "Vận hành" },
  { id: "hr", label: "Quản lý Nhân sự", group: "Nhân sự" },
  { id: "finance", label: "Tài chính & Lương", group: "Nhân sự" },
  { id: "training", label: "Đào tạo nội bộ", group: "Nhân sự" },
  { id: "comms", label: "Truyền thông nội bộ", group: "Nhân sự" },
];

export function getModuleLabel(id: string) {
  return MODULES.find((m) => m.id === id)?.label ?? id;
}
