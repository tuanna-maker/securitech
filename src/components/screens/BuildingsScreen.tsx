import { useMemo, useState } from "react";
import {
  Search, Plus, Pencil, Trash2, Building2, ShieldCheck, MapPin, Users,
  AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Eye,
} from "lucide-react";
import {
  useBuildings, useBuildingStats, useCreateBuilding, useUpdateBuilding, useDeleteBuilding,
} from "@/features/buildings/hooks";
import type { BuildingRow } from "@/features/buildings/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-200/80 rounded-xl shadow-sm ${className}`}>{children}</div>
);

const STATUS_LABEL: Record<string, string> = { normal: "Bình thường", warning: "Cảnh báo", critical: "Nghiêm trọng" };
const STATUS_TONE: Record<string, string> = {
  normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
};

function Kpi({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string | number; tone: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}><Icon className="w-5 h-5" /></div>
        <div className="min-w-0">
          <div className="text-[12px] text-slate-500 font-medium">{label}</div>
          <div className="text-[22px] leading-tight font-bold text-slate-900 mt-0.5">{value}</div>
        </div>
      </div>
    </Card>
  );
}

type FormState = {
  name: string; address: string; region: string; management_company: string;
  status: "normal" | "warning" | "critical"; staff_total: string;
};
const EMPTY_FORM: FormState = {
  name: "", address: "", region: "", management_company: "", status: "normal", staff_total: "0",
};

export default function BuildingsScreen() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BuildingRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<BuildingRow | null>(null);

  const { data: list, isLoading } = useBuildings({
    page, limit: pageSize,
    status: statusFilter !== "all" ? statusFilter : undefined,
    region: regionFilter !== "all" ? regionFilter : undefined,
    search: search || undefined,
  });
  const stats = useBuildingStats();
  const createMut = useCreateBuilding();
  const updateMut = useUpdateBuilding();
  const deleteMut = useDeleteBuilding();
  const { toast } = useToast();

  const buildings = list?.data ?? [];
  const totalPages = list?.totalPages ?? 1;
  const selected = useMemo(
    () => buildings.find((b) => b.id === selectedId) ?? buildings[0] ?? null,
    [buildings, selectedId]
  );

  const regions = useMemo(() => {
    const set = new Set<string>();
    stats.buildings.forEach((b) => b.region && set.add(b.region));
    return Array.from(set);
  }, [stats.buildings]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (b: BuildingRow) => {
    setEditing(b);
    setForm({
      name: b.name, address: b.address ?? "", region: b.region ?? "",
      management_company: b.management_company ?? "", status: b.status,
      staff_total: String(b.staff_total ?? 0),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Vui lòng nhập tên tòa nhà", variant: "destructive" }); return; }
    const payload = {
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      region: form.region.trim() || undefined,
      management_company: form.management_company.trim() || undefined,
      status: form.status,
      staff_total: Number(form.staff_total) || 0,
    };
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, input: payload });
        toast({ title: "Đã cập nhật tòa nhà" });
      } else {
        const created = await createMut.mutateAsync(payload);
        toast({ title: "Đã thêm tòa nhà" });
        setSelectedId(created.id);
      }
      setDialogOpen(false);
    } catch (e: any) {
      toast({ title: "Lỗi", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMut.mutateAsync(confirmDelete.id);
      toast({ title: "Đã xoá tòa nhà" });
      if (selectedId === confirmDelete.id) setSelectedId(null);
      setConfirmDelete(null);
    } catch (e: any) {
      toast({ title: "Lỗi", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 leading-tight">Tòa nhà</h1>
          <p className="text-[12.5px] text-slate-500 mt-0.5">Quản lý danh sách và thông tin các tòa nhà đang vận hành</p>
        </div>
        <Button onClick={openCreate} className="h-9"><Plus className="w-4 h-4 mr-1.5" />Thêm tòa nhà</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={Building2} label="Tổng tòa nhà" value={stats.total} tone="bg-blue-50 text-blue-600" />
        <Kpi icon={ShieldCheck} label="Nhân sự đang trực" value={`${stats.totalStaffOnline}/${stats.totalStaff}`} tone="bg-emerald-50 text-emerald-600" />
        <Kpi icon={AlertTriangle} label="Sự cố hôm nay" value={stats.totalIncidents} tone="bg-amber-50 text-amber-600" />
        <Kpi icon={CheckCircle2} label="SLA trung bình" value={`${stats.avgSla}%`} tone="bg-violet-50 text-violet-600" />
      </div>

      {/* Filters */}
      <Card className="p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm theo tên, địa chỉ..." className="h-9 pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi trạng thái</SelectItem>
            <SelectItem value="normal">Bình thường</SelectItem>
            <SelectItem value="warning">Cảnh báo</SelectItem>
            <SelectItem value="critical">Nghiêm trọng</SelectItem>
          </SelectContent>
        </Select>
        <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Khu vực" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi khu vực</SelectItem>
            {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      {/* Tree + Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Tree / list */}
        <Card className="xl:col-span-4 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="text-[13px] font-semibold text-slate-900">Danh sách ({list?.total ?? 0})</div>
          </div>
          <div className="flex-1 max-h-[560px] overflow-y-auto divide-y divide-slate-50">
            {isLoading && (
              <div className="p-6 text-center text-slate-400 text-[12.5px]">
                <Loader2 className="w-4 h-4 inline animate-spin mr-1.5" />Đang tải...
              </div>
            )}
            {!isLoading && buildings.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-[12.5px]">Không có tòa nhà nào.</div>
            )}
            {buildings.map((b) => {
              const active = selected?.id === b.id;
              return (
                <button key={b.id} onClick={() => setSelectedId(b.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${active ? "bg-blue-50/60" : ""}`}>
                  <div className="flex items-start gap-2.5">
                    <Building2 className={`w-4 h-4 mt-0.5 ${active ? "text-blue-600" : "text-slate-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-semibold truncate ${active ? "text-blue-700" : "text-slate-900"}`}>{b.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{b.address || "Chưa có địa chỉ"}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 text-[10px] rounded border font-medium ${STATUS_TONE[b.status]}`}>
                          {STATUS_LABEL[b.status]}
                        </span>
                        <span className="text-[10.5px] text-slate-500">SLA {b.sla_percent}%</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {/* Pagination */}
          {!isLoading && (list?.total ?? 0) > 0 && (
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-100 text-[12px] text-slate-600">
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-7 w-[72px] text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[12, 24, 48, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="outline" className="h-7 px-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="font-medium">{page}/{totalPages}</span>
                <Button size="sm" variant="outline" className="h-7 px-2" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Detail */}
        <Card className="xl:col-span-8 overflow-hidden">
          {!selected ? (
            <div className="p-10 text-center text-slate-400 text-[13px]">
              <Eye className="w-6 h-6 mx-auto mb-2 opacity-50" />
              Chọn một tòa nhà để xem chi tiết.
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 flex-wrap border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-slate-900">{selected.name}</h3>
                    <span className={`px-2 py-0.5 text-[10.5px] font-semibold rounded-full border ${STATUS_TONE[selected.status]}`}>
                      {STATUS_LABEL[selected.status]}
                    </span>
                  </div>
                  <div className="text-[12px] text-slate-500 mt-1 inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />{selected.address || "Chưa có địa chỉ"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-8" onClick={() => openEdit(selected)}>
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />Sửa
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => setConfirmDelete(selected)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />Xoá
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-3 px-5 py-4 border-b border-slate-100">
                {[
                  { label: "Khu vực", value: selected.region || "—" },
                  { label: "Đơn vị quản lý", value: selected.management_company || "—" },
                  { label: "Toạ độ", value: selected.lat && selected.lng ? `${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}` : "—" },
                  { label: "Ngày tạo", value: new Date(selected.created_at).toLocaleDateString("vi-VN") },
                  { label: "Cập nhật", value: new Date(selected.updated_at).toLocaleDateString("vi-VN") },
                  { label: "ID", value: selected.id.slice(0, 8) },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="text-[10.5px] text-slate-500 uppercase tracking-wide font-medium">{m.label}</div>
                    <div className="text-[12.5px] text-slate-900 font-medium mt-0.5 truncate">{m.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
                {[
                  { icon: Users, label: "Nhân sự trực", value: `${selected.staff_online}/${selected.staff_total}`, tone: "bg-emerald-50 text-emerald-600" },
                  { icon: AlertTriangle, label: "Sự cố hôm nay", value: selected.incidents_today, tone: "bg-amber-50 text-amber-600" },
                  { icon: ShieldCheck, label: "Tuần tra", value: `${selected.patrol_completion}%`, tone: "bg-blue-50 text-blue-600" },
                  { icon: CheckCircle2, label: "SLA", value: `${selected.sla_percent}%`, tone: "bg-violet-50 text-violet-600" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="border border-slate-200/80 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.tone}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{s.label}</div>
                      </div>
                      <div className="text-[18px] font-bold text-slate-900">{s.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Chỉnh sửa tòa nhà" : "Thêm tòa nhà"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-[13px]">
            <div>
              <Label className="text-[12px]">Tên tòa nhà *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="h-9 mt-1" />
            </div>
            <div>
              <Label className="text-[12px]">Địa chỉ</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className="h-9 mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px]">Khu vực</Label>
                <Input value={form.region} onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))} className="h-9 mt-1" placeholder="Hà Nội, TP.HCM..." />
              </div>
              <div>
                <Label className="text-[12px]">Đơn vị quản lý</Label>
                <Input value={form.management_company} onChange={(e) => setForm((f) => ({ ...f, management_company: e.target.value }))} className="h-9 mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px]">Trạng thái</Label>
                <Select value={form.status} onValueChange={(v: any) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Bình thường</SelectItem>
                    <SelectItem value="warning">Cảnh báo</SelectItem>
                    <SelectItem value="critical">Nghiêm trọng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[12px]">Tổng nhân sự</Label>
                <Input type="number" min={0} value={form.staff_total}
                  onChange={(e) => setForm((f) => ({ ...f, staff_total: e.target.value }))} className="h-9 mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}>
              {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              {editing ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá tòa nhà?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xoá <b>{confirmDelete?.name}</b>? Thao tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
