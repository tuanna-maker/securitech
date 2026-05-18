import { useState } from "react";
import KpiCard from "@/components/ui/KpiCard";
import CardPanel from "@/components/ui/CardPanel";
import { Chip } from "@/components/ui/StatusChip";
import ResidentFormDialog, { type Resident } from "@/components/residents/ResidentFormDialog";
import DeleteResidentDialog from "@/components/residents/DeleteResidentDialog";
import ZaloGroupsTab from "@/components/residents/ZaloGroupsTab";
import { toast } from "@/hooks/use-toast";
import { useResidentServiceStats, useParcels, useSupportRequests, useContractors } from "@/features/residents";

/* ── Tabs ── */
const tabs = [
  { id: "parcels", label: "Bưu phẩm" },
  { id: "requests", label: "Yêu cầu hỗ trợ" },
  { id: "contractors", label: "Nhà thầu" },
  { id: "residents", label: "Cư dân" },
  { id: "communities", label: "💬 Nhóm Zalo" },
  { id: "call-guard", label: "🚨 Gọi bảo vệ" },
  { id: "quick-service", label: "Dịch vụ nhanh" },
  { id: "elderly-children", label: "Người già/Trẻ em" },
];

/* ── Parcel data ── */
type ParcelStatus = "received" | "notified" | "picked_up" | "returned";

const parcelStatusConfig: Record<ParcelStatus, { label: string; color: "amber" | "info" | "teal" | "danger" }> = {
  received: { label: "Đã nhận", color: "info" },
  notified: { label: "Đã thông báo", color: "amber" },
  picked_up: { label: "Đã lấy", color: "teal" },
  returned: { label: "Hoàn trả", color: "danger" },
};

interface Parcel {
  id: string;
  recipient: string;
  apartment: string;
  building: string;
  sender: string;
  type: string;
  receivedTime: string;
  status: ParcelStatus;
  receivedBy: string;
  note?: string;
}

const parcels: Parcel[] = [
  { id: "BP-0412", recipient: "Nguyễn Thị Hoa", apartment: "1205", building: "Vinhomes Central Park", sender: "Shopee Express", type: "Hàng hóa", receivedTime: "08:15 hôm nay", status: "notified", receivedBy: "BV Trần Minh", note: "Kiện lớn, để tại sảnh A" },
  { id: "BP-0411", recipient: "Lê Văn Đức", apartment: "0803", building: "Vinhomes Central Park", sender: "Grab Express", type: "Thực phẩm", receivedTime: "07:45 hôm nay", status: "picked_up", receivedBy: "BV Trần Minh" },
  { id: "BP-0410", recipient: "Phạm Minh Tuấn", apartment: "1507", building: "Royal City", sender: "VNPost", type: "Tài liệu", receivedTime: "Hôm qua 16:30", status: "notified", receivedBy: "BV Hoàng Lan" },
  { id: "BP-0409", recipient: "Trần Thị Mai", apartment: "2201", building: "Times City", sender: "J&T Express", type: "Hàng hóa", receivedTime: "Hôm qua 14:20", status: "received", receivedBy: "BV Đỗ Nam" },
  { id: "BP-0408", recipient: "Vũ Quốc Hùng", apartment: "0904", building: "Gamuda Gardens", sender: "Amazon", type: "Điện tử", receivedTime: "Hôm qua 11:00", status: "picked_up", receivedBy: "BV Phạm Bảo" },
  { id: "BP-0407", recipient: "Đỗ Thị Lan", apartment: "1102", building: "Masteri Thảo Điền", sender: "Lazada", type: "Hàng hóa", receivedTime: "20/03 09:30", status: "returned", receivedBy: "BV Lê Tuấn", note: "Cư dân từ chối nhận, hoàn trả shipper" },
  { id: "BP-0406", recipient: "Bùi Thanh Sơn", apartment: "0605", building: "Ecopark", sender: "Tiki", type: "Sách", receivedTime: "20/03 08:00", status: "picked_up", receivedBy: "BV Bùi Sơn" },
  { id: "BP-0405", recipient: "Hoàng Văn Tùng", apartment: "1801", building: "Sunshine City", sender: "GHN", type: "Hàng hóa", receivedTime: "19/03 15:45", status: "picked_up", receivedBy: "BV Hoàng Lan" },
];

/* ── Support Requests ── */
type RequestStatus = "open" | "in_progress" | "resolved" | "cancelled";
type RequestPriority = "high" | "medium" | "low";

const requestStatusConfig: Record<RequestStatus, { label: string; color: "danger" | "amber" | "teal" | "info" }> = {
  open: { label: "Chờ xử lý", color: "danger" },
  in_progress: { label: "Đang xử lý", color: "amber" },
  resolved: { label: "Hoàn thành", color: "teal" },
  cancelled: { label: "Đã hủy", color: "info" },
};

const priorityConfig: Record<RequestPriority, { label: string; color: "danger" | "amber" | "info" }> = {
  high: { label: "Cao", color: "danger" },
  medium: { label: "TB", color: "amber" },
  low: { label: "Thấp", color: "info" },
};

interface SupportRequest {
  id: string;
  resident: string;
  apartment: string;
  building: string;
  category: string;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  assignee: string;
  timeline: { time: string; text: string }[];
}

const supportRequests: SupportRequest[] = [
  {
    id: "YC-0087", resident: "Nguyễn Minh Châu", apartment: "1508", building: "Vinhomes Central Park",
    category: "Kỹ thuật", title: "Kẹt thang máy tầng 15", description: "Thang máy số 3 bị kẹt cửa, không đóng được. Cư dân phải đi thang bộ.",
    priority: "high", status: "in_progress", createdAt: "09:20 hôm nay", assignee: "Phòng kỹ thuật",
    timeline: [
      { time: "09:20", text: "Cư dân báo cáo qua app" },
      { time: "09:22", text: "BV xác nhận, hướng dẫn dùng thang khác" },
      { time: "09:30", text: "Kỹ thuật viên đang kiểm tra" },
    ],
  },
  {
    id: "YC-0086", resident: "Trần Văn Hào", apartment: "0702", building: "Royal City",
    category: "Mở cửa", title: "Quên chìa khóa, cần hỗ trợ mở cửa", description: "Cư dân quên chìa khóa, cần BV hỗ trợ mở cửa căn hộ sau khi xác minh danh tính.",
    priority: "medium", status: "resolved", createdAt: "Hôm qua 22:10", assignee: "BV Trần Minh",
    timeline: [
      { time: "22:10", text: "Cư dân gọi xuống sảnh" },
      { time: "22:15", text: "BV xác minh CMND + ảnh cư dân" },
      { time: "22:20", text: "Mở cửa thành công, ghi nhận sổ trực" },
    ],
  },
  {
    id: "YC-0085", resident: "Lê Thị Hương", apartment: "2003", building: "Times City",
    category: "Vận chuyển", title: "Hỗ trợ vận chuyển đồ nội thất lên tầng", description: "Cần BV hỗ trợ đưa 2 kiện hàng nặng từ sảnh lên căn hộ tầng 20.",
    priority: "low", status: "open", createdAt: "08:00 hôm nay", assignee: "Chưa phân công",
    timeline: [
      { time: "08:00", text: "Cư dân đăng ký qua app" },
    ],
  },
  {
    id: "YC-0084", resident: "Phạm Quốc Anh", apartment: "1201", building: "Gamuda Gardens",
    category: "Kỹ thuật", title: "Rò rỉ nước từ trần nhà", description: "Nước nhỏ giọt từ trần phòng khách, nghi ngờ ống nước tầng trên bị vỡ.",
    priority: "high", status: "in_progress", createdAt: "Hôm qua 19:30", assignee: "Phòng kỹ thuật + Nhà thầu",
    timeline: [
      { time: "19:30", text: "Cư dân báo cáo kèm ảnh" },
      { time: "19:35", text: "BV kiểm tra, xác nhận rò rỉ" },
      { time: "19:45", text: "Liên hệ nhà thầu sửa chữa" },
      { time: "20:00", text: "Nhà thầu xác nhận đến sáng mai" },
    ],
  },
  {
    id: "YC-0083", resident: "Đặng Thị Ngọc", apartment: "0305", building: "Masteri Thảo Điền",
    category: "Khiếu nại", title: "Tiếng ồn từ căn hộ tầng trên", description: "Tiếng ồn liên tục từ 22h-1h sáng, ảnh hưởng giấc ngủ.",
    priority: "medium", status: "resolved", createdAt: "19/03 23:00", assignee: "BV Lê Tuấn",
    timeline: [
      { time: "23:00", text: "Cư dân khiếu nại" },
      { time: "23:10", text: "BV lên tầng nhắc nhở" },
      { time: "23:15", text: "Hộ trên cam kết giảm tiếng ồn" },
    ],
  },
  {
    id: "YC-0082", resident: "Vũ Văn Thành", apartment: "1605", building: "Sunshine City",
    category: "Dịch vụ", title: "Đăng ký sử dụng phòng sinh hoạt cộng đồng", description: "Đặt phòng SHCĐ tầng 3 cho buổi họp gia đình ngày 25/03.",
    priority: "low", status: "resolved", createdAt: "18/03 10:00", assignee: "Lễ tân",
    timeline: [
      { time: "10:00", text: "Cư dân đăng ký qua app" },
      { time: "10:30", text: "Lễ tân xác nhận lịch trống" },
      { time: "11:00", text: "Gửi xác nhận cho cư dân" },
    ],
  },
];

/* ── Contractors ── */
type ContractorStatus = "active" | "completed" | "scheduled" | "suspended";

const contractorStatusConfig: Record<ContractorStatus, { label: string; color: "teal" | "info" | "amber" | "danger" }> = {
  active: { label: "Đang làm việc", color: "teal" },
  completed: { label: "Hoàn thành", color: "info" },
  scheduled: { label: "Đã lên lịch", color: "amber" },
  suspended: { label: "Tạm dừng", color: "danger" },
};

interface Contractor {
  id: string;
  company: string;
  representative: string;
  phone: string;
  service: string;
  building: string;
  area: string;
  status: ContractorStatus;
  entryTime: string;
  exitTime?: string;
  workers: number;
  checkedInBy: string;
  permit: string;
  notes?: string;
}

const contractors: Contractor[] = [
  { id: "NT-041", company: "Cty TNHH Điện lạnh Hòa Phát", representative: "Nguyễn Văn Tân", phone: "0901-xxx-xxx", service: "Sửa chữa điều hòa", building: "Vinhomes Central Park", area: "Tầng 12 - Căn 1205", status: "active", entryTime: "08:30 hôm nay", workers: 2, checkedInBy: "BV Trần Minh", permit: "GP-2025-041", notes: "Mang theo thang nhôm, thiết bị hàn" },
  { id: "NT-040", company: "Cty CP Thang máy Mitsubishi VN", representative: "Trần Đức Minh", phone: "0912-xxx-xxx", service: "Bảo trì thang máy", building: "Royal City", area: "Thang máy 1-4", status: "active", entryTime: "07:00 hôm nay", workers: 4, checkedInBy: "BV Hoàng Lan", permit: "GP-2025-040" },
  { id: "NT-039", company: "Cty Vệ sinh công nghiệp CleanPro", representative: "Lê Thị Hồng", phone: "0988-xxx-xxx", service: "Vệ sinh kính mặt ngoài", building: "Times City", area: "Tòa T1 - Mặt ngoài", status: "scheduled", entryTime: "Ngày mai 06:00", workers: 8, checkedInBy: "—", permit: "GP-2025-039", notes: "Cần phong tỏa khu vực bên dưới" },
  { id: "NT-038", company: "Cty TNHH Cấp thoát nước Sài Gòn", representative: "Phạm Văn Hải", phone: "0977-xxx-xxx", service: "Sửa ống nước tầng hầm", building: "Gamuda Gardens", area: "Tầng hầm B2", status: "active", entryTime: "09:00 hôm nay", workers: 3, checkedInBy: "BV Phạm Bảo", permit: "GP-2025-038" },
  { id: "NT-037", company: "Cty PCCC An Toàn", representative: "Hoàng Minh Đức", phone: "0966-xxx-xxx", service: "Kiểm tra hệ thống PCCC", building: "Masteri Thảo Điền", area: "Toàn tòa nhà", status: "completed", entryTime: "Hôm qua 08:00", exitTime: "Hôm qua 17:00", workers: 5, checkedInBy: "BV Lê Tuấn", permit: "GP-2025-037" },
  { id: "NT-036", company: "Cty Sơn Jotun VN", representative: "Nguyễn Thị Trang", phone: "0933-xxx-xxx", service: "Sơn lại hành lang tầng 5-10", building: "Sunshine City", area: "Tầng 5-10 hành lang", status: "suspended", entryTime: "18/03 07:00", exitTime: "18/03 12:00", workers: 6, checkedInBy: "BV Hoàng Lan", permit: "GP-2025-036", notes: "Tạm dừng do cư dân khiếu nại mùi sơn" },
];

function KpiCards() {
  const { data: stats } = useResidentServiceStats();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
      <KpiCard label="Bưu phẩm chờ lấy" value={stats?.pendingParcels ?? "—"} delta="Chưa giao" color="amber" />
      <KpiCard label="Yêu cầu đang mở" value={stats?.openRequests ?? "—"} delta={`${stats?.highPriorityRequests ?? 0} ưu tiên cao`} color="danger" />
      <KpiCard label="Nhà thầu đang làm" value={stats?.activeContractors ?? "—"} color="teal" />
      <KpiCard label="Hài lòng cư dân" value="—" delta="Đang cập nhật" color="teal" />
      <KpiCard label="Xử lý TB" value="—" delta="Đang cập nhật" color="info" />
    </div>
  );
}

export default function ResidentServicesScreen() {
  const [activeTab, setActiveTab] = useState("parcels");
  const [selectedParcel, setSelectedParcel] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(0);
  const [selectedContractor, setSelectedContractor] = useState(0);

  /* ── Residents state ── */
  const [residentsList, setResidentsList] = useState<Resident[]>([
    { id: "CD-001", name: "Nguyễn Thị Hoa", apartment: "1205", building: "Vinhomes Central Park", phone: "0901-234-567", email: "hoa.nt@email.com", type: "owner", members: 4, moveIn: "15/01/2023", status: "active", vehicles: ["59A-12345 (Ô tô)", "59B1-67890 (Xe máy)"], note: "Thành viên BQT" },
    { id: "CD-002", name: "Lê Văn Đức", apartment: "0803", building: "Vinhomes Central Park", phone: "0912-345-678", email: "duc.lv@email.com", type: "tenant", members: 2, moveIn: "01/06/2024", status: "active", vehicles: ["30H-45678 (Xe máy)"], note: "" },
    { id: "CD-003", name: "Phạm Minh Tuấn", apartment: "1507", building: "Royal City", phone: "0988-456-789", email: "tuan.pm@email.com", type: "owner", members: 5, moveIn: "20/03/2022", status: "active", vehicles: ["30A-11111 (Ô tô)", "29B1-22222 (Xe máy)", "29C1-33333 (Xe máy)"], note: "Có người giúp việc (8h-17h)" },
    { id: "CD-004", name: "Trần Thị Mai", apartment: "2201", building: "Times City", phone: "0977-567-890", email: "mai.tt@email.com", type: "owner", members: 3, moveIn: "10/08/2021", status: "active", vehicles: ["29A-99999 (Ô tô)"], note: "Trưởng ban đại diện cư dân tầng 22" },
    { id: "CD-005", name: "Vũ Quốc Hùng", apartment: "0904", building: "Gamuda Gardens", phone: "0966-678-901", email: "hung.vq@email.com", type: "tenant", members: 1, moveIn: "15/11/2024", status: "active", vehicles: [], note: "Người nước ngoài (Hàn Quốc)" },
    { id: "CD-006", name: "Đỗ Thị Lan", apartment: "1102", building: "Masteri Thảo Điền", phone: "0933-789-012", email: "lan.dt@email.com", type: "owner", members: 4, moveIn: "05/05/2020", status: "active", vehicles: ["51A-55555 (Ô tô)", "59C1-66666 (Xe máy)"], note: "" },
    { id: "CD-007", name: "Bùi Thanh Sơn", apartment: "0605", building: "Ecopark", phone: "0944-890-123", email: "son.bt@email.com", type: "owner", members: 6, moveIn: "01/01/2022", status: "active", vehicles: ["29A-77777 (Ô tô)", "30B-88888 (Ô tô)"], note: "Gia đình có trẻ nhỏ (2 tuổi)" },
    { id: "CD-008", name: "Hoàng Văn Tùng", apartment: "1801", building: "Sunshine City", phone: "0955-901-234", email: "tung.hv@email.com", type: "tenant", members: 2, moveIn: "01/09/2024", status: "inactive", vehicles: ["30H-44444 (Xe máy)"], note: "Đã chuyển đi 01/03/2025" },
  ]);
  const [residentFormOpen, setResidentFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [deleteResident, setDeleteResident] = useState<Resident | null>(null);

  const handleSaveResident = (data: Resident) => {
    setResidentsList(prev => {
      const idx = prev.findIndex(r => r.id === data.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = data;
        toast({ title: "Đã cập nhật", description: `Cư dân ${data.name} đã được cập nhật.` });
        return updated;
      }
      toast({ title: "Đã thêm", description: `Cư dân ${data.name} đã được thêm vào hệ thống.` });
      return [...prev, data];
    });
    setEditingResident(null);
  };

  const handleDeleteResident = () => {
    if (!deleteResident) return;
    setResidentsList(prev => prev.filter(r => r.id !== deleteResident.id));
    toast({ title: "Đã xóa", description: `Cư dân ${deleteResident.name} đã bị xóa.` });
    setDeleteResident(null);
  };

  return (
    <div>
      {/* KPIs */}
      <KpiCards />

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-[11.5px] cursor-pointer transition-all border
              ${activeTab === t.id ? "bg-bg3 text-t1 border-border-strong font-semibold" : "text-t2 border-border hover:text-t1 hover:bg-bg2"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ PARCELS TAB ═══ */}
      {activeTab === "parcels" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-3">
          {/* List */}
          <div className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            <div className="text-[10px] text-t3 uppercase tracking-wider mb-1">Danh sách bưu phẩm gần đây</div>
            {parcels.map((p, i) => {
              const sc = parcelStatusConfig[p.status];
              return (
                <div key={p.id} onClick={() => setSelectedParcel(i)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all
                    ${selectedParcel === i ? "bg-teal-subtle border-border-accent" : "bg-bg1 border-border hover:bg-bg2"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-t3">{p.id}</span>
                    <Chip color={sc.color}>{sc.label}</Chip>
                  </div>
                  <div className="text-[12px] font-semibold mb-0.5">{p.recipient}</div>
                  <div className="text-[10.5px] text-t3">
                    Căn {p.apartment} · {p.building}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-t3">
                    <span>📦 {p.type} — {p.sender}</span>
                    <span className="font-mono">{p.receivedTime}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail */}
          <div className="bg-bg1 border border-border rounded-xl p-3 overflow-y-auto">
            {(() => {
              const p = parcels[selectedParcel];
              const sc = parcelStatusConfig[p.status];
              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-[13px] font-semibold">{p.id} — {p.recipient}</div>
                      <div className="text-[10.5px] text-t3">Căn {p.apartment} · {p.building}</div>
                    </div>
                    <Chip color={sc.color}>{sc.label}</Chip>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: "Người gửi", value: p.sender },
                      { label: "Loại bưu phẩm", value: p.type },
                      { label: "Thời gian nhận", value: p.receivedTime, mono: true },
                      { label: "BV tiếp nhận", value: p.receivedBy },
                    ].map((item, i) => (
                      <div key={i} className="bg-bg2 p-[9px_11px] rounded-lg">
                        <div className="text-[10px] text-t3 mb-[2px]">{item.label}</div>
                        <div className={`text-[12px] ${item.mono ? "font-mono" : "font-semibold"}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {p.note && (
                    <div className="bg-amber-muted/30 border border-amber/20 rounded-lg p-2.5 mb-4">
                      <div className="text-[10px] text-amber font-bold uppercase tracking-wider mb-1">Ghi chú</div>
                      <div className="text-[11.5px]">{p.note}</div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-border">
                    {p.status !== "picked_up" && p.status !== "returned" && (
                      <>
                        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-teal text-bg0 text-xs font-semibold cursor-pointer border border-teal hover:brightness-90">
                          ✓ Đã giao cho cư dân
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-border-strong bg-transparent text-t2 text-xs cursor-pointer hover:border-teal hover:text-teal">
                          📱 Thông báo lại
                        </button>
                      </>
                    )}
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-border-strong bg-transparent text-t2 text-xs cursor-pointer hover:border-teal hover:text-teal">
                      🖨️ In phiếu
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══ REQUESTS TAB ═══ */}
      {activeTab === "requests" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-3">
          {/* List */}
          <div className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            <div className="text-[10px] text-t3 uppercase tracking-wider mb-1">Yêu cầu hỗ trợ từ cư dân</div>
            {supportRequests.map((r, i) => {
              const sc = requestStatusConfig[r.status];
              const pc = priorityConfig[r.priority];
              return (
                <div key={r.id} onClick={() => setSelectedRequest(i)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all
                    ${selectedRequest === i ? "bg-teal-subtle border-border-accent" : "bg-bg1 border-border hover:bg-bg2"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-t3">{r.id}</span>
                      <Chip color={pc.color}>{pc.label}</Chip>
                    </div>
                    <Chip color={sc.color}>{sc.label}</Chip>
                  </div>
                  <div className="text-[12px] font-semibold mb-0.5">{r.title}</div>
                  <div className="text-[10.5px] text-t3">{r.resident} · Căn {r.apartment} · {r.building}</div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-t3">
                    <span>🏷️ {r.category}</span>
                    <span className="font-mono">{r.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail */}
          <div className="bg-bg1 border border-border rounded-xl overflow-hidden">
            {(() => {
              const r = supportRequests[selectedRequest];
              const sc = requestStatusConfig[r.status];
              const pc = priorityConfig[r.priority];
              return (
                <div>
                  <div className="flex items-center justify-between px-[15px] py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-semibold">{r.id} — {r.title}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Chip color={pc.color}>{pc.label}</Chip>
                      <Chip color={sc.color}>{sc.label}</Chip>
                    </div>
                  </div>

                  <div className="p-[13px_15px]">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { label: "Cư dân", value: r.resident },
                        { label: "Căn hộ", value: `${r.apartment} — ${r.building}` },
                        { label: "Danh mục", value: r.category },
                        { label: "Phân công", value: r.assignee },
                        { label: "Thời gian", value: r.createdAt, mono: true },
                      ].map((item, i) => (
                        <div key={i} className={`bg-bg2 p-[9px_11px] rounded-lg ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
                          <div className="text-[10px] text-t3 mb-[2px]">{item.label}</div>
                          <div className={`text-[12px] ${item.mono ? "font-mono" : "font-semibold"}`}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-bg2 rounded-lg p-2.5 mb-4">
                      <div className="text-[10px] text-t3 font-bold uppercase tracking-wider mb-1">Mô tả</div>
                      <div className="text-[11.5px] leading-relaxed">{r.description}</div>
                    </div>

                    {/* Timeline */}
                    <div className="text-[11px] font-bold text-t3 uppercase tracking-wider mb-2">Tiến trình xử lý</div>
                    <div className="relative pl-[18px] mb-4">
                      <div className="absolute left-[5px] top-[6px] bottom-[6px] w-px bg-border" />
                      {r.timeline.map((item, i) => (
                        <div key={i} className="relative mb-[13px] last:mb-0">
                          <div className={`absolute -left-[15px] top-[3px] w-2 h-2 rounded-full border-2 border-bg1 ${i === r.timeline.length - 1 ? "bg-teal" : "bg-border-strong"}`} />
                          <div className="flex items-start gap-2">
                            <span className="font-mono text-[10px] text-t3 shrink-0 w-[70px]">{item.time}</span>
                            <span className="text-xs leading-relaxed">{item.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border">
                      {r.status !== "resolved" && r.status !== "cancelled" && (
                        <>
                          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-teal text-bg0 text-xs font-semibold cursor-pointer border border-teal hover:brightness-90">
                            ✓ Đánh dấu hoàn thành
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-border-strong bg-transparent text-t2 text-xs cursor-pointer hover:border-teal hover:text-teal">
                            📝 Thêm ghi chú
                          </button>
                        </>
                      )}
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-border-strong bg-transparent text-t2 text-xs cursor-pointer hover:border-teal hover:text-teal">
                        📋 Xuất biên bản
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ═══ CONTRACTORS TAB ═══ */}
      {activeTab === "contractors" && (
        <div>
          {/* Active contractors summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <CardPanel title="Nhà thầu đang làm việc">
              {contractors.filter(c => c.status === "active").map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <div>
                    <div className="text-[11px] font-semibold">{c.company}</div>
                    <div className="text-[10px] text-t3">{c.building} · {c.workers} người</div>
                  </div>
                  <Chip color="teal">Đang làm</Chip>
                </div>
              ))}
            </CardPanel>
            <CardPanel title="Lịch trình sắp tới">
              {contractors.filter(c => c.status === "scheduled").map((c) => (
                <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <div>
                    <div className="text-[11px] font-semibold">{c.company}</div>
                    <div className="text-[10px] text-t3">{c.service}</div>
                  </div>
                  <span className="text-[10px] font-mono text-amber">{c.entryTime}</span>
                </div>
              ))}
              {contractors.filter(c => c.status === "scheduled").length === 0 && (
                <div className="text-[11px] text-t3 py-2">Không có lịch trình</div>
              )}
            </CardPanel>
            <CardPanel title="Thống kê tháng này">
              <div className="space-y-2">
                {[
                  { label: "Tổng lượt nhà thầu", value: "28", color: "text-t1" },
                  { label: "Vi phạm nội quy", value: "2", color: "text-danger" },
                  { label: "Hoàn thành đúng hạn", value: "92%", color: "text-teal" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-t3">{s.label}</span>
                    <span className={`text-[13px] font-bold font-mono ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </CardPanel>
          </div>

          {/* Contractor table */}
          <CardPanel title="Chi tiết nhà thầu" action="+ Đăng ký nhà thầu">
            <div className="overflow-x-auto">
              <table className="w-full text-[11.5px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-t3 font-medium">Mã</th>
                    <th className="text-left py-2 px-2 text-t3 font-medium">Công ty</th>
                    <th className="text-left py-2 px-2 text-t3 font-medium">Dịch vụ</th>
                    <th className="text-left py-2 px-2 text-t3 font-medium">Tòa nhà</th>
                    <th className="text-left py-2 px-2 text-t3 font-medium">Khu vực</th>
                    <th className="text-center py-2 px-2 text-t3 font-medium">Nhân công</th>
                    <th className="text-left py-2 px-2 text-t3 font-medium">Vào</th>
                    <th className="text-left py-2 px-2 text-t3 font-medium">Ra</th>
                    <th className="text-center py-2 px-2 text-t3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {contractors.map((c, idx) => {
                    const sc = contractorStatusConfig[c.status];
                    return (
                      <tr key={c.id} onClick={() => setSelectedContractor(idx)}
                        className={`border-b border-border/50 cursor-pointer transition-colors
                          ${selectedContractor === idx ? "bg-teal-subtle" : "hover:bg-bg2"}`}>
                        <td className="py-2 px-2 font-mono text-t3">{c.id}</td>
                        <td className="py-2 px-2">
                          <div className="font-semibold">{c.company}</div>
                          <div className="text-[10px] text-t3">{c.representative}</div>
                        </td>
                        <td className="py-2 px-2">{c.service}</td>
                        <td className="py-2 px-2 text-t3">{c.building}</td>
                        <td className="py-2 px-2 text-t3 text-[10.5px]">{c.area}</td>
                        <td className="py-2 px-2 text-center font-mono">{c.workers}</td>
                        <td className="py-2 px-2 font-mono text-[10.5px]">{c.entryTime}</td>
                        <td className="py-2 px-2 font-mono text-[10.5px]">{c.exitTime || "—"}</td>
                        <td className="py-2 px-2 text-center"><Chip color={sc.color}>{sc.label}</Chip></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardPanel>

          {/* Selected contractor detail */}
          {(() => {
            const c = contractors[selectedContractor];
            const sc = contractorStatusConfig[c.status];
            return (
              <div className="mt-3 bg-bg1 border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[13px] font-semibold">{c.company}</div>
                    <div className="text-[10.5px] text-t3">{c.id} · Giấy phép: {c.permit}</div>
                  </div>
                  <Chip color={sc.color}>{sc.label}</Chip>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { label: "Người đại diện", value: c.representative },
                    { label: "Liên hệ", value: c.phone, mono: true },
                    { label: "Dịch vụ", value: c.service },
                    { label: "Khu vực", value: `${c.building} — ${c.area}` },
                    { label: "Nhân công", value: `${c.workers} người` },
                    { label: "BV kiểm tra", value: c.checkedInBy },
                    { label: "Giờ vào", value: c.entryTime, mono: true },
                    { label: "Giờ ra", value: c.exitTime || "Chưa ra", mono: true },
                  ].map((item, i) => (
                    <div key={i} className="bg-bg2 p-[9px_11px] rounded-lg">
                      <div className="text-[10px] text-t3 mb-[2px]">{item.label}</div>
                      <div className={`text-[12px] ${item.mono ? "font-mono" : "font-semibold"}`}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {c.notes && (
                  <div className="bg-amber-muted/30 border border-amber/20 rounded-lg p-2.5 mb-3">
                    <div className="text-[10px] text-amber font-bold uppercase tracking-wider mb-1">Ghi chú</div>
                    <div className="text-[11.5px]">{c.notes}</div>
                  </div>
                )}
                <div className="flex gap-2 pt-3 border-t border-border">
                  {c.status === "active" && (
                    <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-teal text-bg0 text-xs font-semibold cursor-pointer border border-teal hover:brightness-90">
                      ✓ Ghi nhận ra khỏi tòa nhà
                    </button>
                  )}
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-border-strong bg-transparent text-t2 text-xs cursor-pointer hover:border-teal hover:text-teal">
                    📋 In giấy phép
                  </button>
                  {c.status === "active" && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-danger/30 bg-transparent text-danger text-xs cursor-pointer hover:bg-danger-muted">
                      ⚠ Báo vi phạm
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ═══ CALL GUARD TAB ═══ */}
      {activeTab === "call-guard" && (() => {
        const guardCalls = [
          { id: "CG-0031", resident: "Nguyễn Thị Lan", apartment: "1205", building: "Vinhomes Central Park", reason: "Nghe tiếng động lạ hành lang", status: "responding" as const, time: "09:45 hôm nay", guard: "BV Trần Minh", responseTime: "1 phút 20s", location: "Tầng 12, hành lang B" },
          { id: "CG-0030", resident: "Trần Quốc Bảo", apartment: "0803", building: "Royal City", reason: "Người lạ đứng trước cửa", status: "resolved" as const, time: "08:20 hôm nay", guard: "BV Hoàng Lan", responseTime: "2 phút 05s", location: "Tầng 8, căn 0803" },
          { id: "CG-0029", resident: "Lê Thị Hương", apartment: "2003", building: "Times City", reason: "Mùi khói từ căn bên cạnh", status: "resolved" as const, time: "Hôm qua 22:10", guard: "BV Đỗ Nam", responseTime: "1 phút 45s", location: "Tầng 20, căn 2004" },
          { id: "CG-0028", resident: "Phạm Văn Hải", apartment: "0605", building: "Gamuda Gardens", reason: "Trẻ em bị kẹt thang máy", status: "escalated" as const, time: "Hôm qua 18:30", guard: "BV Phạm Bảo", responseTime: "0 phút 50s", location: "Thang máy 2" },
          { id: "CG-0027", resident: "Đặng Ngọc Mai", apartment: "1102", building: "Masteri Thảo Điền", reason: "Khẩn cấp y tế - người ngất", status: "escalated" as const, time: "Hôm qua 15:00", guard: "BV Lê Tuấn", responseTime: "1 phút 10s", location: "Hồ bơi tầng 3" },
        ];
        const callStatusConfig = {
          responding: { label: "Đang phản hồi", color: "amber" as const },
          resolved: { label: "Đã xử lý", color: "teal" as const },
          escalated: { label: "Đã chuyển cấp", color: "danger" as const },
        };

        return (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-3">
            {/* Left: Call button + recent calls */}
            <div>
              {/* 1-Touch Call CTA */}
              <div className="bg-danger-muted border border-danger/20 rounded-xl p-4 mb-3 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-danger/20 border-2 border-danger flex items-center justify-center animate-pulse">
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-danger"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <div className="text-[15px] font-bold text-danger mb-1">Gọi bảo vệ 1 chạm</div>
                <div className="text-[11px] text-t3 mb-3">Cư dân nhấn nút → BV gần nhất nhận thông báo + GPS định vị</div>
                <button className="px-6 py-2.5 rounded-lg bg-danger text-bg0 text-[13px] font-bold cursor-pointer border border-danger hover:brightness-90 transition-all">
                  🚨 MÔ PHỎNG CUỘC GỌI
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
                  <div className="text-[18px] font-bold font-mono text-teal">1:32</div>
                  <div className="text-[10px] text-t3">TB phản hồi</div>
                </div>
                <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
                  <div className="text-[18px] font-bold font-mono text-t1">47</div>
                  <div className="text-[10px] text-t3">Cuộc gọi tháng</div>
                </div>
                <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
                  <div className="text-[18px] font-bold font-mono text-teal">98%</div>
                  <div className="text-[10px] text-t3">Phản hồi đúng</div>
                </div>
              </div>

              {/* Recent calls list */}
              <div className="text-[10px] text-t3 uppercase tracking-wider mb-1.5">Cuộc gọi gần đây</div>
              <div className="space-y-1.5">
                {guardCalls.map((c) => {
                  const sc = callStatusConfig[c.status];
                  return (
                    <div key={c.id} className="p-2.5 rounded-lg border border-border bg-bg1 hover:bg-bg2 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-t3">{c.id}</span>
                        <Chip color={sc.color}>{sc.label}</Chip>
                      </div>
                      <div className="text-[12px] font-semibold mb-0.5">{c.reason}</div>
                      <div className="text-[10.5px] text-t3">{c.resident} · Căn {c.apartment} · {c.building}</div>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-t3">
                        <span>⏱ {c.responseTime} · {c.guard}</span>
                        <span className="font-mono">{c.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: How it works + config */}
            <div className="space-y-3">
              <CardPanel title="Quy trình hoạt động">
                <div className="relative pl-5">
                  <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
                  {[
                    { step: "1", title: "Cư dân nhấn nút SOS", desc: "Từ app hoặc nút vật lý trong căn hộ", icon: "📱" },
                    { step: "2", title: "Hệ thống định vị GPS", desc: "Xác định vị trí chính xác của cư dân", icon: "📍" },
                    { step: "3", title: "BV gần nhất nhận cuộc gọi", desc: "Thông báo push + chuông báo trên bộ đàm", icon: "🔔" },
                    { step: "4", title: "BV phản hồi & di chuyển", desc: "Xác nhận đã nhận, GPS tracking lộ trình", icon: "🏃" },
                    { step: "5", title: "Xử lý & báo cáo", desc: "Ghi nhận sự việc, ảnh chụp, biên bản", icon: "📋" },
                  ].map((s, i) => (
                    <div key={i} className="relative mb-4 last:mb-0">
                      <div className="absolute -left-[11px] top-0.5 w-[14px] h-[14px] rounded-full bg-teal text-bg0 text-[8px] font-bold flex items-center justify-center">{s.step}</div>
                      <div className="ml-2">
                        <div className="text-[12px] font-semibold flex items-center gap-1.5">{s.icon} {s.title}</div>
                        <div className="text-[10.5px] text-t3">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardPanel>

              <CardPanel title="Phân loại cuộc gọi tháng này">
                <div className="space-y-2">
                  {[
                    { label: "An ninh (người lạ, trộm)", value: 18, pct: 38, color: "bg-danger" },
                    { label: "Kỹ thuật (thang máy, điện)", value: 12, pct: 26, color: "bg-amber" },
                    { label: "Y tế khẩn cấp", value: 8, pct: 17, color: "bg-danger" },
                    { label: "Tiếng ồn / tranh chấp", value: 5, pct: 11, color: "bg-info" },
                    { label: "Khác", value: 4, pct: 8, color: "bg-bg3" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px]">{item.label}</span>
                        <span className="text-[11px] font-mono text-t3">{item.value} ({item.pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-bg3 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardPanel>
            </div>
          </div>
        );
      })()}

      {/* ═══ QUICK SERVICE TAB ═══ */}
      {activeTab === "quick-service" && (() => {
        const serviceCategories = [
          { id: "cleaning", icon: "🧹", label: "Dọn dẹp", desc: "Vệ sinh căn hộ, lau kính", price: "200K–500K", available: 3 },
          { id: "repair", icon: "🔧", label: "Sửa chữa", desc: "Điện, nước, điều hòa", price: "150K–1M", available: 2 },
          { id: "laundry", icon: "👔", label: "Giặt là", desc: "Giặt ủi, giặt hấp", price: "50K–200K", available: 1 },
          { id: "moving", icon: "📦", label: "Vận chuyển", desc: "Chuyển đồ nội khu", price: "100K–300K", available: 2 },
          { id: "pest", icon: "🐛", label: "Diệt côn trùng", desc: "Phun khử khuẩn", price: "300K–800K", available: 1 },
          { id: "garden", icon: "🌿", label: "Chăm sóc cây", desc: "Tưới cây, cắt tỉa", price: "100K–250K", available: 1 },
        ];

        const serviceRequests = [
          { id: "DV-0098", resident: "Nguyễn Minh Châu", apartment: "1508", building: "Vinhomes Central Park", service: "Dọn dẹp", detail: "Vệ sinh toàn bộ căn hộ 2PN", status: "in_progress" as const, time: "09:00 hôm nay", assignee: "Chị Hoa - CleanPro", price: "350,000đ", eta: "11:00" },
          { id: "DV-0097", resident: "Trần Văn Hào", apartment: "0702", building: "Royal City", service: "Sửa chữa", detail: "Vòi nước bồn rửa bị rỉ", status: "pending" as const, time: "08:45 hôm nay", assignee: "Chưa phân công", price: "Báo giá sau", eta: "—" },
          { id: "DV-0096", resident: "Lê Thị Hương", apartment: "2003", building: "Times City", service: "Giặt là", detail: "5 bộ vest + 3 áo dài", status: "completed" as const, time: "Hôm qua 14:00", assignee: "Giặt ủi Hoàng Gia", price: "280,000đ", eta: "—" },
          { id: "DV-0095", resident: "Phạm Quốc Anh", apartment: "1201", building: "Gamuda Gardens", service: "Vận chuyển", detail: "Chuyển tủ lạnh từ sảnh lên tầng 12", status: "completed" as const, time: "Hôm qua 10:30", assignee: "BV Phạm Bảo + 1", price: "150,000đ", eta: "—" },
          { id: "DV-0094", resident: "Đặng Ngọc Mai", apartment: "1102", building: "Masteri Thảo Điền", service: "Diệt côn trùng", detail: "Phun muỗi căn hộ + ban công", status: "scheduled" as const, time: "Ngày mai 08:00", assignee: "Cty Pest Control VN", price: "500,000đ", eta: "08:00" },
        ];

        const svcStatusConfig = {
          pending: { label: "Chờ xác nhận", color: "amber" as const },
          in_progress: { label: "Đang thực hiện", color: "info" as const },
          completed: { label: "Hoàn thành", color: "teal" as const },
          scheduled: { label: "Đã lên lịch", color: "amber" as const },
        };

        return (
          <div>
            {/* Service categories grid */}
            <div className="text-[10px] text-t3 uppercase tracking-wider mb-2">Danh mục dịch vụ</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
              {serviceCategories.map((s) => (
                <div key={s.id} className="bg-bg1 border border-border rounded-xl p-3 text-center hover:bg-bg2 hover:border-border-strong cursor-pointer transition-all group">
                  <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform">{s.icon}</div>
                  <div className="text-[12px] font-semibold mb-0.5">{s.label}</div>
                  <div className="text-[10px] text-t3 mb-1.5">{s.desc}</div>
                  <div className="text-[10px] font-mono text-teal">{s.price}</div>
                  <div className="text-[9px] text-t3 mt-1">{s.available} đơn vị sẵn sàng</div>
                </div>
              ))}
            </div>

            {/* Flow explanation */}
            <div className="bg-teal-subtle border border-teal/10 rounded-xl p-3 mb-4">
              <div className="text-[11px] font-bold text-teal uppercase tracking-wider mb-2">Quy trình đặt dịch vụ</div>
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <span className="bg-bg1 px-2.5 py-1 rounded-lg border border-border">📱 Cư dân yêu cầu</span>
                <span className="text-t3">→</span>
                <span className="bg-bg1 px-2.5 py-1 rounded-lg border border-border">🛡️ BV xác nhận</span>
                <span className="text-t3">→</span>
                <span className="bg-bg1 px-2.5 py-1 rounded-lg border border-border">👷 Đối tác thực hiện</span>
                <span className="text-t3">→</span>
                <span className="bg-bg1 px-2.5 py-1 rounded-lg border border-border">✅ Nghiệm thu</span>
                <span className="text-t3">→</span>
                <span className="bg-bg1 px-2.5 py-1 rounded-lg border border-border">💳 Thanh toán</span>
              </div>
            </div>

            {/* Recent service requests */}
            <CardPanel title="Yêu cầu dịch vụ gần đây" action="+ Tạo yêu cầu">
              <div className="overflow-x-auto">
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-t3 font-medium">Mã</th>
                      <th className="text-left py-2 px-2 text-t3 font-medium">Cư dân</th>
                      <th className="text-left py-2 px-2 text-t3 font-medium">Dịch vụ</th>
                      <th className="text-left py-2 px-2 text-t3 font-medium">Chi tiết</th>
                      <th className="text-left py-2 px-2 text-t3 font-medium">Phân công</th>
                      <th className="text-right py-2 px-2 text-t3 font-medium">Chi phí</th>
                      <th className="text-center py-2 px-2 text-t3 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRequests.map((r) => {
                      const sc = svcStatusConfig[r.status];
                      return (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-bg2 transition-colors cursor-pointer">
                          <td className="py-2 px-2 font-mono text-t3">{r.id}</td>
                          <td className="py-2 px-2">
                            <div className="font-semibold">{r.resident}</div>
                            <div className="text-[10px] text-t3">Căn {r.apartment} · {r.building}</div>
                          </td>
                          <td className="py-2 px-2">{r.service}</td>
                          <td className="py-2 px-2 text-t3 max-w-[180px] truncate">{r.detail}</td>
                          <td className="py-2 px-2 text-[10.5px]">{r.assignee}</td>
                          <td className="py-2 px-2 text-right font-mono">{r.price}</td>
                          <td className="py-2 px-2 text-center"><Chip color={sc.color}>{sc.label}</Chip></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardPanel>
          </div>
        );
      })()}

      {/* ═══ ELDERLY/CHILDREN TAB ═══ */}
      {activeTab === "elderly-children" && (() => {
        const specialResidents = [
          { id: "DC-001", name: "Bà Nguyễn Thị Ngọc", apartment: "0502", building: "Vinhomes Central Park", type: "elderly" as const, age: 78, notes: "Sống một mình, có bệnh tim. Con gái: Trần Thị Hoa (0901-xxx-xxx)", emergencyContact: "0901-xxx-xxx", lastCheck: "09:00 hôm nay", status: "normal" as const },
          { id: "DC-002", name: "Ông Trần Văn Bình", apartment: "1203", building: "Royal City", type: "elderly" as const, age: 82, notes: "Đi lại khó khăn, dùng xe lăn. Có người giúp việc buổi sáng", emergencyContact: "0912-xxx-xxx", lastCheck: "08:30 hôm nay", status: "normal" as const },
          { id: "DC-003", name: "Cháu Lê Minh Anh", apartment: "2003", building: "Times City", type: "child" as const, age: 5, notes: "Hay chơi ở sân khu B một mình. Mẹ: Lê Thị Hương", emergencyContact: "0988-xxx-xxx", lastCheck: "Hôm qua 17:00", status: "attention" as const },
          { id: "DC-004", name: "Bà Phạm Thị Huệ", apartment: "0305", building: "Gamuda Gardens", type: "elderly" as const, age: 85, notes: "Bệnh Alzheimer giai đoạn đầu, đôi khi quên đường về", emergencyContact: "0977-xxx-xxx", lastCheck: "08:00 hôm nay", status: "attention" as const },
          { id: "DC-005", name: "Cháu Nguyễn Gia Bảo", apartment: "1801", building: "Sunshine City", type: "child" as const, age: 7, notes: "Đi học về một mình lúc 16h30. Ba mẹ đi làm đến 18h", emergencyContact: "0966-xxx-xxx", lastCheck: "Hôm qua 16:30", status: "normal" as const },
        ];

        const recentAssists = [
          { time: "09:15 hôm nay", action: "Dẫn bà Ngọc (0502) từ sảnh lên căn hộ", guard: "BV Trần Minh", type: "elderly" as const },
          { time: "08:45 hôm nay", action: "Hỗ trợ ông Bình (1203) xuống xe lăn ở hầm xe", guard: "BV Hoàng Lan", type: "elderly" as const },
          { time: "Hôm qua 17:00", action: "Phát hiện cháu Minh Anh (2003) chơi một mình, đưa về sảnh chờ mẹ", guard: "BV Đỗ Nam", type: "child" as const },
          { time: "Hôm qua 14:30", action: "Bà Huệ (0305) đi lạc tầng 7, BV dẫn về căn hộ", guard: "BV Phạm Bảo", type: "elderly" as const },
          { time: "Hôm qua 10:00", action: "Hỗ trợ bà Ngọc (0502) nhận thuốc từ shipper", guard: "BV Trần Minh", type: "elderly" as const },
        ];

        const typeConfig = {
          elderly: { label: "Người cao tuổi", color: "amber" as const, icon: "👴" },
          child: { label: "Trẻ em", color: "info" as const, icon: "👶" },
        };
        const statusConfig2 = {
          normal: { label: "Bình thường", color: "teal" as const },
          attention: { label: "Cần lưu ý", color: "amber" as const },
          emergency: { label: "Khẩn cấp", color: "danger" as const },
        };

        return (
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-3">
            {/* Left: Registry */}
            <div>
              <div className="bg-amber-muted/30 border border-amber/20 rounded-xl p-3 mb-3">
                <div className="text-[11px] font-bold text-amber uppercase tracking-wider mb-1">⚠ Lưu ý đặc biệt</div>
                <div className="text-[11px] leading-relaxed">
                  Danh sách cư dân cần hỗ trợ đặc biệt. BV phải kiểm tra tình trạng hàng ngày và ghi nhận vào hệ thống. 
                  Ưu tiên phản hồi khẩn cấp cho nhóm này.
                </div>
              </div>

              <div className="text-[10px] text-t3 uppercase tracking-wider mb-2">Danh sách cư dân đặc biệt</div>
              <div className="space-y-2">
                {specialResidents.map((r) => {
                  const tc = typeConfig[r.type];
                  const sc = statusConfig2[r.status];
                  return (
                    <div key={r.id} className="bg-bg1 border border-border rounded-xl p-3 hover:bg-bg2 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{tc.icon}</span>
                          <div>
                            <div className="text-[12.5px] font-semibold">{r.name}</div>
                            <div className="text-[10.5px] text-t3">Căn {r.apartment} · {r.building} · {r.age} tuổi</div>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <Chip color={tc.color}>{tc.label}</Chip>
                          <Chip color={sc.color}>{sc.label}</Chip>
                        </div>
                      </div>

                      <div className="bg-bg2 rounded-lg p-2.5 mb-2">
                        <div className="text-[10px] text-t3 font-bold uppercase tracking-wider mb-0.5">Ghi chú quan trọng</div>
                        <div className="text-[11px] leading-relaxed">{r.notes}</div>
                      </div>

                      <div className="flex items-center justify-between text-[10.5px]">
                        <div className="flex items-center gap-3">
                          <span className="text-t3">📞 {r.emergencyContact}</span>
                          <span className="text-t3">🕐 Kiểm tra: {r.lastCheck}</span>
                        </div>
                        <button className="px-2 py-1 rounded text-[10px] bg-teal/10 text-teal border border-teal/20 cursor-pointer hover:bg-teal/20 transition-colors">
                          ✓ Đã kiểm tra
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Recent assists + protocols */}
            <div className="space-y-3">
              <CardPanel title="Hỗ trợ gần đây">
                <div className="space-y-2">
                  {recentAssists.map((a, i) => {
                    const tc = typeConfig[a.type];
                    return (
                      <div key={i} className="flex items-start gap-2 py-2 border-b border-border/30 last:border-0">
                        <span className="text-sm shrink-0 mt-0.5">{tc.icon}</span>
                        <div className="flex-1">
                          <div className="text-[11.5px] leading-relaxed">{a.action}</div>
                          <div className="text-[10px] text-t3 mt-0.5">{a.guard} · {a.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardPanel>

              <CardPanel title="Quy trình ứng xử">
                <div className="space-y-3">
                  {[
                    { title: "Người cao tuổi đi lạc", steps: "Hỏi thăm nhẹ nhàng → Kiểm tra danh sách DC → Liên hệ người thân → Đưa về căn hộ", color: "text-amber" },
                    { title: "Trẻ em không có người lớn", steps: "Quan sát từ xa → Hỏi thăm → Kiểm tra danh sách DC → Gọi phụ huynh → Đưa về sảnh an toàn", color: "text-info" },
                    { title: "Khẩn cấp y tế", steps: "Gọi 115 ngay → Sơ cứu cơ bản → Liên hệ người thân → Báo BQL → Lập biên bản", color: "text-danger" },
                  ].map((p, i) => (
                    <div key={i} className="bg-bg2 rounded-lg p-2.5">
                      <div className={`text-[11px] font-bold ${p.color} mb-1`}>{p.title}</div>
                      <div className="text-[10.5px] text-t3 leading-relaxed">{p.steps}</div>
                    </div>
                  ))}
                </div>
              </CardPanel>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
                  <div className="text-[18px] font-bold font-mono text-amber">5</div>
                  <div className="text-[10px] text-t3">Người cao tuổi</div>
                </div>
                <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
                  <div className="text-[18px] font-bold font-mono text-info">3</div>
                  <div className="text-[10px] text-t3">Trẻ em cần lưu ý</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ RESIDENTS TAB ═══ */}
      {activeTab === "residents" && (() => {
        const typeConfig = { owner: { label: "Chủ sở hữu", color: "teal" as const }, tenant: { label: "Thuê", color: "info" as const } };
        const statusConfig3 = { active: { label: "Đang ở", color: "teal" as const }, inactive: { label: "Đã chuyển", color: "amber" as const } };

        const [residentFilter, setResidentFilter] = useState<"all" | "owner" | "tenant">("all");
        const [searchResident, setSearchResident] = useState("");

        const filtered = residentsList.filter(r => {
          if (residentFilter !== "all" && r.type !== residentFilter) return false;
          if (searchResident && !r.name.toLowerCase().includes(searchResident.toLowerCase()) && !r.apartment.includes(searchResident) && !r.phone.includes(searchResident)) return false;
          return true;
        });

        return (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
                <div className="text-[18px] font-bold font-mono text-t1">{residentsList.length}</div>
                <div className="text-[10px] text-t3">Tổng hộ dân</div>
              </div>
              <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
                <div className="text-[18px] font-bold font-mono text-teal">{residentsList.filter(r => r.type === "owner").length}</div>
                <div className="text-[10px] text-t3">Chủ sở hữu</div>
              </div>
              <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
                <div className="text-[18px] font-bold font-mono text-info">{residentsList.filter(r => r.type === "tenant").length}</div>
                <div className="text-[10px] text-t3">Thuê</div>
              </div>
              <div className="bg-bg1 border border-border rounded-lg p-2.5 text-center">
                <div className="text-[18px] font-bold font-mono text-t1">{residentsList.reduce((s, r) => s + r.members, 0)}</div>
                <div className="text-[10px] text-t3">Tổng cư dân</div>
              </div>
            </div>

            {/* Search + filter */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <input
                value={searchResident}
                onChange={e => setSearchResident(e.target.value)}
                placeholder="Tìm tên, căn hộ, SĐT..."
                className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border border-border bg-bg1 text-[12px] placeholder:text-t3 focus:outline-none focus:border-border-accent"
              />
              {(["all", "owner", "tenant"] as const).map(f => (
                <button key={f} onClick={() => setResidentFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] cursor-pointer border transition-all
                    ${residentFilter === f ? "bg-bg3 text-t1 border-border-strong font-semibold" : "text-t2 border-border hover:text-t1 hover:bg-bg2"}`}>
                  {f === "all" ? "Tất cả" : f === "owner" ? "Chủ sở hữu" : "Thuê"}
                </button>
              ))}
              <button onClick={() => { setEditingResident(null); setResidentFormOpen(true); }}
                className="px-3 py-1.5 rounded-lg text-[11px] cursor-pointer border border-teal bg-teal/10 text-teal font-semibold hover:bg-teal/20 transition-all">
                + Thêm cư dân
              </button>
            </div>

            {/* Resident table */}
            <CardPanel title={`Danh sách cư dân (${filtered.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-[11.5px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 text-t3 font-medium">Mã</th>
                      <th className="text-left py-2 px-2 text-t3 font-medium">Họ tên</th>
                      <th className="text-left py-2 px-2 text-t3 font-medium">Căn hộ</th>
                      <th className="text-left py-2 px-2 text-t3 font-medium">Tòa nhà</th>
                      <th className="text-center py-2 px-2 text-t3 font-medium">Loại</th>
                      <th className="text-center py-2 px-2 text-t3 font-medium">Thành viên</th>
                      <th className="text-left py-2 px-2 text-t3 font-medium">SĐT</th>
                      <th className="text-left py-2 px-2 text-t3 font-medium">Phương tiện</th>
                      <th className="text-center py-2 px-2 text-t3 font-medium">Trạng thái</th>
                      <th className="text-center py-2 px-2 text-t3 font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => {
                      const tc = typeConfig[r.type];
                      const sc = statusConfig3[r.status];
                      return (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-bg2 transition-colors">
                          <td className="py-2 px-2 font-mono text-t3">{r.id}</td>
                          <td className="py-2 px-2">
                            <div className="font-semibold">{r.name}</div>
                            {r.note && <div className="text-[10px] text-t3">{r.note}</div>}
                          </td>
                          <td className="py-2 px-2 font-mono">{r.apartment}</td>
                          <td className="py-2 px-2 text-t3">{r.building}</td>
                          <td className="py-2 px-2 text-center"><Chip color={tc.color}>{tc.label}</Chip></td>
                          <td className="py-2 px-2 text-center font-mono">{r.members}</td>
                          <td className="py-2 px-2 font-mono text-[10.5px]">{r.phone}</td>
                          <td className="py-2 px-2 text-[10px] text-t3 max-w-[160px]">{r.vehicles.length > 0 ? r.vehicles.join(", ") : "—"}</td>
                          <td className="py-2 px-2 text-center"><Chip color={sc.color}>{sc.label}</Chip></td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => { setEditingResident(r); setResidentFormOpen(true); }}
                                className="px-1.5 py-0.5 rounded text-[10px] text-info border border-info/30 hover:bg-info/10 cursor-pointer transition-colors">
                                ✏️ Sửa
                              </button>
                              <button onClick={() => setDeleteResident(r)}
                                className="px-1.5 py-0.5 rounded text-[10px] text-danger border border-danger/30 hover:bg-danger/10 cursor-pointer transition-colors">
                                🗑️ Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardPanel>
          </div>
        );
      })()}

      {/* ═══ ZALO GROUPS TAB ═══ */}
      {activeTab === "communities" && <ZaloGroupsTab />}

      {/* Resident CRUD Dialogs */}
      <ResidentFormDialog
        open={residentFormOpen}
        onOpenChange={setResidentFormOpen}
        resident={editingResident}
        onSave={handleSaveResident}
      />
      <DeleteResidentDialog
        open={!!deleteResident}
        onOpenChange={(open) => { if (!open) setDeleteResident(null); }}
        residentName={deleteResident?.name || ""}
        onConfirm={handleDeleteResident}
      />
    </div>
  );
}
