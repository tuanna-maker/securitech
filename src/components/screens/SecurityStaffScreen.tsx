import { useMemo, useState, useEffect } from "react";
import {
  Users, ShieldCheck, AlertTriangle, Search, Plus, Eye, Pencil, Trash2,
  X, Phone, MessageSquare, Loader2, Radio, MapPin, Activity,
} from "lucide-react";
import {
  useStaffMembers, useCreateStaffMember, useUpdateStaffMember, useDeleteStaffMember,
  type StaffStatus,
} from "@/features/workforce";
import { useBuildings } from "@/features/buildings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

/* ── Types & helpers ── */
type StaffRow = {
  id: string;
  name: string;
  role: string;
  status: StaffStatus;
  building_id: string | null;
  phone: string | null;
  employee_id: string | null;
  zone: string | null;
  last_check_in: string | null;
  building_name?: string | null;
};

const STATUS_LABEL: Record<StaffStatus, string> = {
  "on-patrol": "Đang tuần tra",
  "stationary": "Trực tại chốt",
  "offline": "Ngoại tuyến",
};

const STATUS_TONE: Record<StaffStatus, string> = {
  "on-patrol": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "stationary": "bg-sky-50 text-sky-700 border-sky-200",
  "offline": "bg-slate-100 text-slate-600 border-slate-200",
};

const TABS: { id: "all" | StaffStatus; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "on-patrol", label: "Đang tuần tra" },
  { id: "stationary", label: "Trực tại chốt" },
  { id: "offline", label: "Ngoại tuyến" },
];

/* ── primitives ── */
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-200/80 rounded-xl shadow-sm ${className}`}>{children}</div>
);

function StatusChip({ s }: { s: StaffStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${STATUS_TONE[s]}`}>
      {STATUS_LABEL[s]}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, sub, iconBg, iconColor, subTone }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
  iconBg: string; iconColor: string; subTone?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-slate-500 font-medium">{label}</div>
          <div className="text-[22px] leading-tight font-bold text-slate-900 mt-0.5">{value}</div>
          {sub && <div className={`text-[11px] mt-0.5 ${subTone || "text-slate-500"}`}>{sub}</div>}
        </div>
      </div>
    </Card>
  );
}

/* ── Form Dialog ── */
function StaffFormDialog({
  open, onOpenChange, editing,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; editing: StaffRow | null;
}) {
  const { toast } = useToast();
  const { data: buildingsRes } = useBuildings();
  const buildings = (buildingsRes as any)?.data ?? [];
  const create = useCreateStaffMember();
  const update = useUpdateStaffMember();
  const isEdit = !!editing;

  const [form, setForm] = useState({
    name: "", role: "Bảo vệ", status: "offline" as StaffStatus,
    building_id: "" as string, phone: "", employee_id: "", zone: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: editing?.name ?? "",
        role: editing?.role ?? "Bảo vệ",
        status: (editing?.status as StaffStatus) ?? "offline",
        building_id: editing?.building_id ?? "",
        phone: editing?.phone ?? "",
        employee_id: editing?.employee_id ?? "",
        zone: editing?.zone ?? "",
      });
    }
  }, [open, editing]);

  const submit = async () => {
    if (!form.name.trim()) {
      toast({ title: "Vui lòng nhập tên nhân viên", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name.trim(),
      role: form.role.trim() || "Bảo vệ",
      status: form.status,
      building_id: form.building_id || null,
      phone: form.phone.trim() || null,
      employee_id: form.employee_id.trim() || null,
      zone: form.zone.trim() || null,
    };
    try {
      if (isEdit && editing) {
        await update.mutateAsync({ id: editing.id, ...payload });
        toast({ title: "Đã cập nhật nhân viên" });
      } else {
        await create.mutateAsync(payload);
        toast({ title: "Đã thêm nhân viên mới" });
      }
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: "Lỗi", description: e.message, variant: "destructive" });
    }
  };

  const busy = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}</DialogTitle>
          <DialogDescription>Thông tin nhân viên bảo vệ thuộc tòa nhà quản lý.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Họ và tên *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Trần Văn Minh" />
          </div>
          <div>
            <Label>Mã nhân viên</Label>
            <Input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="NV0001" />
          </div>
          <div>
            <Label>Vị trí</Label>
            <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Bảo vệ / Trưởng ca" />
          </div>
          <div>
            <Label>SĐT</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0912 345 678" />
          </div>
          <div>
            <Label>Khu vực</Label>
            <Input value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Sảnh A / Hầm B" />
          </div>
          <div>
            <Label>Tòa nhà</Label>
            <Select value={form.building_id || "none"} onValueChange={(v) => setForm({ ...form, building_id: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Chọn tòa nhà" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Chưa phân công —</SelectItem>
                {buildings.map((b: any) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Trạng thái</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as StaffStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="on-patrol">Đang tuần tra</SelectItem>
                <SelectItem value="stationary">Trực tại chốt</SelectItem>
                <SelectItem value="offline">Ngoại tuyến</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={submit} disabled={busy}>
            {busy && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            {isEdit ? "Lưu" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Main screen ── */
export default function SecurityStaffScreen() {
  const { data: staff = [], isLoading } = useStaffMembers() as { data: StaffRow[]; isLoading: boolean };
  const del = useDeleteStaffMember();
  const { toast } = useToast();

  const [tab, setTab] = useState<"all" | StaffStatus>("all");
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState<string>("all");
  const [selected, setSelected] = useState<StaffRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Auto-select first row
  useEffect(() => {
    if (!selected && staff.length > 0) setSelected(staff[0]);
  }, [staff, selected]);

  const stats = useMemo(() => {
    const total = staff.length;
    const onPatrol = staff.filter((s) => s.status === "on-patrol").length;
    const stationary = staff.filter((s) => s.status === "stationary").length;
    const offline = staff.filter((s) => s.status === "offline").length;
    const unassigned = staff.filter((s) => !s.building_id).length;
    const buildings = new Set(staff.map((s) => s.building_id).filter(Boolean)).size;
    const pct = (n: number) => total > 0 ? `${((n / total) * 100).toFixed(1)}%` : "0%";
    return { total, onPatrol, stationary, offline, unassigned, buildings, pct };
  }, [staff]);

  const buildingOptions = useMemo(() => {
    const m = new Map<string, string>();
    staff.forEach((s) => { if (s.building_id && s.building_name) m.set(s.building_id, s.building_name); });
    return Array.from(m.entries());
  }, [staff]);

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (tab !== "all" && s.status !== tab) return false;
      if (buildingFilter !== "all" && s.building_id !== buildingFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) &&
            !(s.employee_id ?? "").toLowerCase().includes(q) &&
            !(s.phone ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [staff, tab, buildingFilter, search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await del.mutateAsync(deleteId);
      toast({ title: "Đã xoá nhân viên" });
      if (selected?.id === deleteId) setSelected(null);
    } catch (e: any) {
      toast({ title: "Lỗi", description: e.message, variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard icon={Users} label="Tổng nhân sự" value={stats.total} sub="100%"
          iconBg="bg-blue-50" iconColor="text-blue-600" />
        <KpiCard icon={ShieldCheck} label="Đang tuần tra" value={stats.onPatrol} sub={stats.pct(stats.onPatrol)}
          iconBg="bg-emerald-50" iconColor="text-emerald-600" subTone="text-emerald-600" />
        <KpiCard icon={Radio} label="Trực tại chốt" value={stats.stationary} sub={stats.pct(stats.stationary)}
          iconBg="bg-sky-50" iconColor="text-sky-600" subTone="text-sky-600" />
        <KpiCard icon={Activity} label="Ngoại tuyến" value={stats.offline} sub={stats.pct(stats.offline)}
          iconBg="bg-slate-100" iconColor="text-slate-600" />
        <KpiCard icon={MapPin} label="Tòa nhà phụ trách" value={stats.buildings} sub="Đang phân công"
          iconBg="bg-violet-50" iconColor="text-violet-600" />
        <KpiCard icon={AlertTriangle} label="Chưa phân công" value={stats.unassigned}
          sub={stats.unassigned > 0 ? "Cần phân công" : "Đã phân công đủ"}
          iconBg="bg-rose-50" iconColor="text-rose-600"
          subTone={stats.unassigned > 0 ? "text-rose-600" : "text-emerald-600"} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* Main */}
        <div className="space-y-4 min-w-0">
          <Card className="overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-200/80 overflow-x-auto">
              {TABS.map((t) => {
                const count = t.id === "all" ? stats.total
                  : t.id === "on-patrol" ? stats.onPatrol
                  : t.id === "stationary" ? stats.stationary
                  : stats.offline;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-3 py-2 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px ${tab === t.id ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-slate-700"}`}>
                    {t.label} <span className="text-[11px] text-slate-400 ml-1">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 p-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Tìm theo tên, mã NV, SĐT..." />
              </div>
              <select value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}
                className="h-9 px-3 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-700">
                <option value="all">Tất cả tòa nhà</option>
                {buildingOptions.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="h-9">
                <Plus className="w-3.5 h-3.5 mr-1" /> Thêm nhân sự
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead className="bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wide">
                  <tr>
                    {["STT","Họ và tên","Mã NV","Vị trí","Tòa nhà","Khu vực","SĐT","Trạng thái","Hành động"].map((h) => (
                      <th key={h} className="text-left font-semibold px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading && (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Đang tải...
                    </td></tr>
                  )}
                  {!isLoading && filtered.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                      Chưa có nhân viên nào. Bấm "Thêm nhân sự" để tạo mới.
                    </td></tr>
                  )}
                  {filtered.map((s, i) => (
                    <tr key={s.id} onClick={() => setSelected(s)}
                      className={`border-t border-slate-100 cursor-pointer hover:bg-slate-50/70 ${selected?.id === s.id ? "bg-blue-50/40" : ""}`}>
                      <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px] font-semibold">
                            {s.name.split(" ").slice(-1)[0][0]?.toUpperCase()}
                          </div>
                          <span className="text-slate-900 font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 font-mono text-[12px]">{s.employee_id || "—"}</td>
                      <td className="px-4 py-2.5 text-slate-700">{s.role}</td>
                      <td className="px-4 py-2.5 text-slate-700">{s.building_name || <span className="text-slate-400 italic">Chưa gán</span>}</td>
                      <td className="px-4 py-2.5 text-slate-700">{s.zone || "—"}</td>
                      <td className="px-4 py-2.5 text-slate-700">{s.phone || "—"}</td>
                      <td className="px-4 py-2.5"><StatusChip s={s.status} /></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1 text-slate-500" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setSelected(s)} className="p-1 hover:bg-slate-100 rounded" title="Xem"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => { setEditing(s); setFormOpen(true); }} className="p-1 hover:bg-slate-100 rounded" title="Sửa"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteId(s.id)} className="p-1 hover:bg-rose-50 hover:text-rose-600 rounded" title="Xoá"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200/80 text-[12px] text-slate-500">
              <div>Hiển thị {filtered.length} / {stats.total} nhân sự</div>
            </div>
          </Card>
        </div>

        {/* Detail panel */}
        {selected && (
          <Card className="p-4 h-fit xl:sticky xl:top-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-semibold text-slate-900">Thông tin nhân sự</h3>
              <button onClick={() => setSelected(null)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start gap-3 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-lg">
                {selected.name.split(" ").slice(-1)[0][0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-[15px] font-semibold text-slate-900">{selected.name}</div>
                  {selected.employee_id && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">{selected.employee_id}</span>
                  )}
                </div>
                <div className="text-[12px] text-slate-500 mt-0.5">{selected.role}</div>
                {selected.building_name && (
                  <div className="text-[12px] text-slate-500">{selected.building_name}{selected.zone ? ` · ${selected.zone}` : ""}</div>
                )}
                <div className="mt-1.5"><StatusChip s={selected.status} /></div>
              </div>
            </div>

            <div className="py-3 border-b border-slate-100">
              <div className="text-[12px] font-semibold text-slate-900 mb-2">Thông tin liên hệ</div>
              <div className="space-y-1.5 text-[12px]">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">SĐT</span>
                  <span className="text-slate-800">{selected.phone || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Khu vực</span>
                  <span className="text-slate-800">{selected.zone || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Check-in cuối</span>
                  <span className="text-slate-800">
                    {selected.last_check_in ? new Date(selected.last_check_in).toLocaleString("vi-VN") : "Chưa có"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => { setEditing(selected); setFormOpen(true); }}>
                <Pencil className="w-3.5 h-3.5 mr-1" /> Sửa
              </Button>
              <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700"
                onClick={() => setDeleteId(selected.id)}>
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Xoá
              </Button>
              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="col-span-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="w-3.5 h-3.5 mr-1" /> Gọi
                  </Button>
                </a>
              )}
              <Button size="sm" className={selected.phone ? "" : "col-span-2"}>
                <MessageSquare className="w-3.5 h-3.5 mr-1" /> Nhắn tin
              </Button>
            </div>
          </Card>
        )}
      </div>

      <StaffFormDialog open={formOpen} onOpenChange={setFormOpen} editing={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Nhân viên sẽ bị xoá khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
