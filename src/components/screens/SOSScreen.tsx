import { useEffect, useMemo, useState } from "react";
import { Siren, Phone, MapPin, Clock, CheckCircle2, UserCheck, Loader2, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Eye, Building2, User, Activity, Timer, FileText, X } from "lucide-react";
import { useSOSCalls, useUpdateSOSCall } from "@/features/residents/hooks";
import { useStaffMembers } from "@/features/workforce";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xử lý", dispatched: "Đã điều động", resolved: "Đã xử lý", canceled: "Đã huỷ",
};
const STATUS_TONE: Record<string, string> = {
  pending: "bg-rose-50 text-rose-700 border-rose-200",
  dispatched: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  canceled: "bg-slate-100 text-slate-600 border-slate-200",
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-200/80 rounded-xl shadow-sm ${className}`}>{children}</div>
);

function Kpi({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}><Icon className="w-5 h-5" /></div>
        <div>
          <div className="text-[12px] text-slate-500 font-medium">{label}</div>
          <div className="text-[22px] leading-tight font-bold text-slate-900 mt-0.5">{value}</div>
        </div>
      </div>
    </Card>
  );
}

function fmtTime(s: string | null) { return s ? new Date(s).toLocaleString("vi-VN") : "—"; }
function fmtDur(s: number | null) {
  if (!s) return "—";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60); const sec = s % 60;
  return `${m}p ${sec}s`;
}

export default function SOSScreen() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"created_at" | "status" | "response_time_seconds">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: sos = [], isLoading } = useSOSCalls(statusFilter === "all" ? {} : { status: statusFilter });
  const { data: staff = [] } = useStaffMembers();
  const update = useUpdateSOSCall();
  const { toast } = useToast();

  const selected = useMemo<any>(() => sos.find((s: any) => s.id === selectedId) || null, [sos, selectedId]);

  const stats = useMemo(() => ({
    pending: sos.filter((s: any) => s.status === "pending").length,
    dispatched: sos.filter((s: any) => s.status === "dispatched").length,
    resolved: sos.filter((s: any) => s.status === "resolved").length,
    total: sos.length,
  }), [sos]);

  const filtered = useMemo(() => sos.filter((s: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.caller_name ?? "").toLowerCase().includes(q)
      || (s.caller_phone ?? "").includes(q)
      || (s.location_description ?? "").toLowerCase().includes(q)
      || (s.buildings?.name ?? "").toLowerCase().includes(q);
  }), [sos, search]);

  const STATUS_ORDER: Record<string, number> = { pending: 0, dispatched: 1, resolved: 2, canceled: 3 };
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a: any, b: any) => {
      let va: any, vb: any;
      if (sortKey === "created_at") { va = new Date(a.created_at).getTime(); vb = new Date(b.created_at).getTime(); }
      else if (sortKey === "status") { va = STATUS_ORDER[a.status] ?? 99; vb = STATUS_ORDER[b.status] ?? 99; }
      else { va = a.response_time_seconds ?? Number.POSITIVE_INFINITY; vb = b.response_time_seconds ?? Number.POSITIVE_INFINITY; }
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);
  useEffect(() => { setPage(1); }, [search, statusFilter, sortKey, sortDir, pageSize]);
  const pageRows = useMemo(() => sorted.slice((page - 1) * pageSize, page * pageSize), [sorted, page, pageSize]);

  const toggleSort = (k: typeof sortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir(k === "created_at" ? "desc" : "asc"); }
  };
  const SortHeader = ({ k, label }: { k: typeof sortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-slate-700">
      {label}
      {sortKey === k && (sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
    </button>
  );

  const handleDispatch = async (id: string, guardId: string) => {
    try {
      await update.mutateAsync({ id, status: "dispatched", dispatched_guard_id: guardId });
      toast({ title: "Đã điều động bảo vệ" });
    } catch (e: any) { toast({ title: "Lỗi", description: e.message, variant: "destructive" }); }
  };
  const handleResolve = async (id: string) => {
    try {
      await update.mutateAsync({ id, status: "resolved" });
      toast({ title: "Đã đánh dấu xử lý xong" });
    } catch (e: any) { toast({ title: "Lỗi", description: e.message, variant: "destructive" }); }
  };
  const handleCancel = async (id: string) => {
    try {
      await update.mutateAsync({ id, status: "canceled" });
      toast({ title: "Đã huỷ" });
    } catch (e: any) { toast({ title: "Lỗi", description: e.message, variant: "destructive" }); }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={Siren} label="Chờ xử lý" value={stats.pending} tone="bg-rose-50 text-rose-600" />
        <Kpi icon={UserCheck} label="Đã điều động" value={stats.dispatched} tone="bg-amber-50 text-amber-600" />
        <Kpi icon={CheckCircle2} label="Đã xử lý" value={stats.resolved} tone="bg-emerald-50 text-emerald-600" />
        <Kpi icon={Clock} label="Tổng cuộc gọi" value={stats.total} tone="bg-blue-50 text-blue-600" />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-200/80">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Tìm theo người gọi, SĐT, vị trí, tòa nhà..." />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="dispatched">Đã điều động</SelectItem>
              <SelectItem value="resolved">Đã xử lý</SelectItem>
              <SelectItem value="canceled">Đã huỷ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-slate-50/70 text-slate-500 text-[11px] uppercase tracking-wide">
              <tr>
                <th className="text-left font-semibold px-4 py-2.5"><SortHeader k="created_at" label="Thời gian" /></th>
                <th className="text-left font-semibold px-4 py-2.5">Người gọi</th>
                <th className="text-left font-semibold px-4 py-2.5">Vị trí</th>
                <th className="text-left font-semibold px-4 py-2.5">Tòa nhà</th>
                <th className="text-left font-semibold px-4 py-2.5"><SortHeader k="status" label="Trạng thái" /></th>
                <th className="text-left font-semibold px-4 py-2.5">Bảo vệ</th>
                <th className="text-left font-semibold px-4 py-2.5"><SortHeader k="response_time_seconds" label="Phản hồi" /></th>
                <th className="text-left font-semibold px-4 py-2.5">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Đang tải...
                </td></tr>
              )}
              {!isLoading && sorted.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Không có cuộc gọi SOS nào.</td></tr>
              )}
              {pageRows.map((s: any) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{fmtTime(s.created_at)}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-900">{s.caller_name || "Khuyết danh"}</div>
                    {s.caller_phone && <div className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Phone className="w-3 h-3" />{s.caller_phone}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {s.location_description ? (
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{s.location_description}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{s.buildings?.name || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${STATUS_TONE[s.status]}`}>
                      {STATUS_LABEL[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{s.staff_members?.name || <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-2.5 text-slate-700">{fmtDur(s.response_time_seconds)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] text-slate-600" onClick={() => setSelectedId(s.id)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {s.status === "pending" && (
                        <Select onValueChange={(v) => handleDispatch(s.id, v)}>
                          <SelectTrigger className="h-7 w-[140px] text-[11px]"><SelectValue placeholder="Điều động..." /></SelectTrigger>
                          <SelectContent>
                            {staff.filter((g: any) => g.status !== "offline").map((g: any) => (
                              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {s.status === "dispatched" && (
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => handleResolve(s.id)}>
                          Xử lý xong
                        </Button>
                      )}
                      {(s.status === "pending" || s.status === "dispatched") && (
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] text-slate-500" onClick={() => handleCancel(s.id)}>
                          Huỷ
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && sorted.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-slate-200/80 text-[12px] text-slate-600">
            <div>
              Hiển thị <span className="font-semibold text-slate-800">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)}</span> / {sorted.length}
            </div>
            <div className="flex items-center gap-2">
              <span>Mỗi trang:</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="h-7 w-[72px] text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-7 px-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="font-medium">Trang {page} / {totalPages}</span>
              <Button size="sm" variant="outline" className="h-7 px-2" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Siren className="w-5 h-5" />
                  </div>
                  <div>
                    <SheetTitle className="text-[15px]">Chi tiết SOS</SheetTitle>
                    <SheetDescription className="text-[12px]">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${STATUS_TONE[selected.status]}`}>
                        {STATUS_LABEL[selected.status]}
                      </span>
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-5 space-y-5 text-[13px]">
                <section>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Người gọi</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-800"><User className="w-4 h-4 text-slate-400" />{selected.caller_name || "Khuyết danh"}</div>
                    <div className="flex items-center gap-2 text-slate-700"><Phone className="w-4 h-4 text-slate-400" />{selected.caller_phone || "—"}</div>
                  </div>
                </section>

                <Separator />

                <section>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Vị trí</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-700"><Building2 className="w-4 h-4 text-slate-400" />{selected.buildings?.name || "—"}</div>
                    <div className="flex items-start gap-2 text-slate-700"><MapPin className="w-4 h-4 text-slate-400 mt-0.5" />{selected.location_description || "—"}</div>
                    {(selected.lat && selected.lng) ? (
                      <div className="text-[11px] text-slate-500 ml-6">Toạ độ: {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}</div>
                    ) : null}
                  </div>
                </section>

                <Separator />

                <section>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">Diễn biến điều động</div>
                  <ol className="relative border-l border-slate-200 ml-2 space-y-3">
                    <li className="ml-4">
                      <div className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="text-slate-800 font-medium">Tiếp nhận cuộc gọi</div>
                      <div className="text-[11px] text-slate-500">{fmtTime(selected.created_at)}</div>
                    </li>
                    {selected.status !== "pending" && (
                      <li className="ml-4">
                        <div className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <div className="text-slate-800 font-medium">
                          Điều động {selected.staff_members?.name ? `– ${selected.staff_members.name}` : ""}
                        </div>
                        <div className="text-[11px] text-slate-500">{fmtTime(selected.updated_at)}</div>
                      </li>
                    )}
                    {selected.status === "resolved" && (
                      <li className="ml-4">
                        <div className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <div className="text-slate-800 font-medium">Đã xử lý xong</div>
                        <div className="text-[11px] text-slate-500">{fmtTime(selected.resolved_at)}</div>
                      </li>
                    )}
                    {selected.status === "canceled" && (
                      <li className="ml-4">
                        <div className="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <div className="text-slate-800 font-medium">Đã huỷ</div>
                        <div className="text-[11px] text-slate-500">{fmtTime(selected.updated_at)}</div>
                      </li>
                    )}
                  </ol>
                </section>

                <Separator />

                <section className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Timer className="w-3 h-3" /> Thời gian phản hồi</div>
                    <div className="text-[18px] font-bold text-slate-900 mt-0.5">{fmtDur(selected.response_time_seconds)}</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500 inline-flex items-center gap-1"><Activity className="w-3 h-3" /> Bảo vệ</div>
                    <div className="text-[14px] font-semibold text-slate-900 mt-0.5 truncate">{selected.staff_members?.name || "Chưa điều động"}</div>
                  </div>
                </section>

                {selected.notes && (
                  <>
                    <Separator />
                    <section>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2 inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Ghi chú</div>
                      <div className="text-slate-700 whitespace-pre-wrap">{selected.notes}</div>
                    </section>
                  </>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {selected.status === "pending" && (
                    <Select onValueChange={(v) => { handleDispatch(selected.id, v); }}>
                      <SelectTrigger className="h-8 flex-1 text-[12px]"><SelectValue placeholder="Điều động bảo vệ..." /></SelectTrigger>
                      <SelectContent>
                        {staff.filter((g: any) => g.status !== "offline").map((g: any) => (
                          <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selected.status === "dispatched" && (
                    <Button size="sm" className="h-8 text-[12px]" onClick={() => handleResolve(selected.id)}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Xử lý xong
                    </Button>
                  )}
                  {(selected.status === "pending" || selected.status === "dispatched") && (
                    <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => handleCancel(selected.id)}>
                      <X className="w-3.5 h-3.5 mr-1" /> Huỷ
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
