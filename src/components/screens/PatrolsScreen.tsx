import { useMemo, useState, useEffect } from "react";
import { Plus, Loader2, Trash2, MapPin, CheckCircle2, Circle, Search, Route, X, GripVertical } from "lucide-react";
import {
  usePatrols, useCheckpoints, useStaffMembers,
  useCreatePatrolRoute, useUpdatePatrolRoute, useDeletePatrolRoute,
  useCreateCheckpoint, useUpdateCheckpoint, useDeleteCheckpoint,
} from "@/features/workforce";
import { useBuildings } from "@/features/buildings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Sắp diễn ra", active: "Đang tuần tra", completed: "Hoàn thành", missed: "Bỏ lỡ",
};
const STATUS_TONE: Record<string, string> = {
  upcoming: "bg-slate-100 text-slate-600 border-slate-200",
  active: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  missed: "bg-rose-50 text-rose-700 border-rose-200",
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-200/80 rounded-xl shadow-sm ${className}`}>{children}</div>
);

function fmtTime(s: string | null) { return s ? new Date(s).toLocaleString("vi-VN") : "—"; }

/* ── Route form ── */
function RouteFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { toast } = useToast();
  const { data: buildingsRes } = useBuildings();
  const buildings = (buildingsRes as any)?.data ?? [];
  const { data: staff = [] } = useStaffMembers();
  const create = useCreatePatrolRoute();
  const [form, setForm] = useState({ building_id: "", guard_id: "", notes: "" });

  useEffect(() => { if (open) setForm({ building_id: "", guard_id: "", notes: "" }); }, [open]);

  const submit = async () => {
    if (!form.building_id) { toast({ title: "Chọn tòa nhà", variant: "destructive" }); return; }
    try {
      await create.mutateAsync({
        building_id: form.building_id,
        guard_id: form.guard_id || null,
        notes: form.notes || null,
      });
      toast({ title: "Đã tạo tuyến tuần tra" });
      onOpenChange(false);
    } catch (e: any) { toast({ title: "Lỗi", description: e.message, variant: "destructive" }); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo tuyến tuần tra</DialogTitle>
          <DialogDescription>Sau khi tạo, bạn có thể thêm các điểm checkpoint.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Tòa nhà *</Label>
            <Select value={form.building_id} onValueChange={(v) => setForm({ ...form, building_id: v })}>
              <SelectTrigger><SelectValue placeholder="Chọn tòa nhà" /></SelectTrigger>
              <SelectContent>{buildings.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Bảo vệ phụ trách</Label>
            <Select value={form.guard_id || "none"} onValueChange={(v) => setForm({ ...form, guard_id: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Chưa phân công —</SelectItem>
                {staff.map((g: any) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Ghi chú</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="VD: Tuần tra ca đêm, kiểm tra hệ thống PCCC..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}Tạo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Checkpoints panel ── */
function CheckpointsPanel({ routeId, routeName }: { routeId: string; routeName: string }) {
  const { data: checkpoints = [], isLoading } = useCheckpoints(routeId);
  const create = useCreateCheckpoint();
  const update = useUpdateCheckpoint();
  const del = useDeleteCheckpoint();
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await create.mutateAsync({ route_id: routeId, name: newName.trim(), sequence_order: checkpoints.length + 1 });
      setNewName("");
    } catch (e: any) { toast({ title: "Lỗi", description: e.message, variant: "destructive" }); }
  };

  const toggleComplete = async (cp: any) => {
    try {
      await update.mutateAsync({ id: cp.id, route_id: routeId, completed: !cp.completed });
    } catch (e: any) { toast({ title: "Lỗi", description: e.message, variant: "destructive" }); }
  };

  const saveName = async () => {
    if (!editing || !editing.name.trim()) return;
    try {
      await update.mutateAsync({ id: editing.id, route_id: routeId, name: editing.name.trim() });
      setEditing(null);
    } catch (e: any) { toast({ title: "Lỗi", description: e.message, variant: "destructive" }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await del.mutateAsync({ id: deleteId, route_id: routeId });
      toast({ title: "Đã xoá checkpoint" });
    } catch (e: any) { toast({ title: "Lỗi", description: e.message, variant: "destructive" }); }
    setDeleteId(null);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-semibold text-slate-900">Checkpoints</h3>
          <p className="text-[11px] text-slate-500">{routeName}</p>
        </div>
        <span className="text-[11px] text-slate-500">{checkpoints.filter(c => c.completed).length}/{checkpoints.length} hoàn thành</span>
      </div>

      <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
        {isLoading && <div className="text-center py-6 text-slate-400 text-[12px]"><Loader2 className="w-4 h-4 animate-spin inline" /></div>}
        {!isLoading && checkpoints.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-[12px]">Chưa có checkpoint nào.</div>
        )}
        {checkpoints.map((cp, i) => (
          <div key={cp.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${cp.completed ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-slate-200"}`}>
            <GripVertical className="w-3.5 h-3.5 text-slate-300" />
            <button onClick={() => toggleComplete(cp)} className="shrink-0">
              {cp.completed
                ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                : <Circle className="w-4 h-4 text-slate-400" />}
            </button>
            <span className="text-[11px] text-slate-400 font-mono w-5">{i + 1}.</span>
            {editing?.id === cp.id ? (
              <input autoFocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                onBlur={saveName} onKeyDown={(e) => e.key === "Enter" && saveName()}
                className="flex-1 h-7 px-2 text-[12px] border border-blue-400 rounded outline-none" />
            ) : (
              <button onClick={() => setEditing({ id: cp.id, name: cp.name })}
                className={`flex-1 text-left text-[12px] ${cp.completed ? "line-through text-slate-500" : "text-slate-800"}`}>
                {cp.name}
              </button>
            )}
            {cp.completed_at && <span className="text-[10px] text-slate-400">{new Date(cp.completed_at).toLocaleTimeString("vi-VN")}</span>}
            <button onClick={() => setDeleteId(cp.id)} className="p-1 text-slate-400 hover:text-rose-600">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Tên checkpoint mới (VD: Sảnh A - Tầng 1)" className="h-8 text-[12px]" />
        <Button size="sm" className="h-8" onClick={handleAdd} disabled={create.isPending}>
          {create.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        </Button>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá checkpoint?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

/* ── Main ── */
export default function PatrolsScreen() {
  const { data: routes = [], isLoading } = usePatrols();
  const delRoute = useDeletePatrolRoute();
  const updRoute = useUpdatePatrolRoute();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && routes.length > 0) setSelectedId(routes[0].id);
  }, [routes, selectedId]);

  const stats = useMemo(() => ({
    active: routes.filter(r => r.status === "active").length,
    completed: routes.filter(r => r.status === "completed").length,
    missed: routes.filter(r => r.status === "missed").length,
    total: routes.length,
  }), [routes]);

  const filtered = useMemo(() => routes.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (r.building_name ?? "").toLowerCase().includes(q)
        || (r.guard_name ?? "").toLowerCase().includes(q);
    }
    return true;
  }), [routes, statusFilter, search]);

  const selected = routes.find(r => r.id === selectedId) ?? null;

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await delRoute.mutateAsync(deleteId);
      toast({ title: "Đã xoá tuyến tuần tra" });
      if (selectedId === deleteId) setSelectedId(null);
    } catch (e: any) { toast({ title: "Lỗi", description: e.message, variant: "destructive" }); }
    setDeleteId(null);
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await updRoute.mutateAsync({ id, status });
    } catch (e: any) { toast({ title: "Lỗi", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4"><div className="text-[12px] text-slate-500">Đang tuần tra</div><div className="text-[22px] font-bold text-blue-600">{stats.active}</div></Card>
        <Card className="p-4"><div className="text-[12px] text-slate-500">Hoàn thành</div><div className="text-[22px] font-bold text-emerald-600">{stats.completed}</div></Card>
        <Card className="p-4"><div className="text-[12px] text-slate-500">Bỏ lỡ</div><div className="text-[22px] font-bold text-rose-600">{stats.missed}</div></Card>
        <Card className="p-4"><div className="text-[12px] text-slate-500">Tổng tuyến</div><div className="text-[22px] font-bold text-slate-900">{stats.total}</div></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-200/80">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="Tìm theo tòa nhà, bảo vệ..." />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang tuần tra</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="missed">Bỏ lỡ</SelectItem>
                <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setFormOpen(true)} className="h-9">
              <Plus className="w-3.5 h-3.5 mr-1" /> Tạo tuyến
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wide">
                <tr>{["Tuyến / Tòa nhà","Bảo vệ","Bắt đầu","Hoàn thành","Trạng thái","Tiến độ","Hành động"].map(h => (
                  <th key={h} className="text-left font-semibold px-4 py-2.5">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {isLoading && <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Đang tải...</td></tr>}
                {!isLoading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Chưa có tuyến tuần tra nào.</td></tr>}
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => setSelectedId(r.id)}
                    className={`border-t border-slate-100 cursor-pointer hover:bg-slate-50/70 ${selectedId === r.id ? "bg-blue-50/40" : ""}`}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Route className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-900">{r.building_name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{r.guard_name || <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-2.5 text-slate-600 text-[12px]">{fmtTime(r.start_time)}</td>
                    <td className="px-4 py-2.5 text-slate-600 text-[12px]">{fmtTime(r.end_time)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${STATUS_TONE[r.status]}`}>
                        {STATUS_LABEL[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.completion}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium w-8">{Number(r.completion)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {r.status === "active" && (
                          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => handleStatus(r.id, "missed")}>
                            Đánh dấu lỡ
                          </Button>
                        )}
                        <button onClick={() => setDeleteId(r.id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {selected ? (
          <CheckpointsPanel routeId={selected.id} routeName={selected.building_name || "Tuyến tuần tra"} />
        ) : (
          <Card className="p-8 text-center text-[12px] text-slate-400">
            <MapPin className="w-6 h-6 mx-auto mb-2 opacity-40" />
            Chọn 1 tuyến để xem checkpoints
          </Card>
        )}
      </div>

      <RouteFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá tuyến tuần tra?</AlertDialogTitle>
            <AlertDialogDescription>Toàn bộ checkpoints của tuyến cũng sẽ bị xoá.</AlertDialogDescription>
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
