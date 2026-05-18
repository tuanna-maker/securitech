import { useMemo, useState } from "react";
import KpiCard from "@/components/ui/KpiCard";
import CardPanel from "@/components/ui/CardPanel";
import { Chip } from "@/components/ui/StatusChip";
import { useWorkforceStats, useShifts, type ShiftRow } from "@/features/workforce";
import { Plus, Filter, Search, ChevronDown, MoreHorizontal, Calendar, Copy, History, FileDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShiftFormDialog from "@/components/workforce/ShiftFormDialog";

type ShiftKind = "morning" | "afternoon" | "night";

const KIND_STYLES: Record<ShiftKind, { dot: string; bg: string; label: string }> = {
  morning: { dot: "bg-teal", bg: "bg-teal/10", label: "Ca sáng (06:00 - 14:00)" },
  afternoon: { dot: "bg-amber", bg: "bg-amber/10", label: "Ca chiều (14:00 - 22:00)" },
  night: { dot: "bg-info", bg: "bg-info/10", label: "Ca đêm (22:00 - 06:00)" },
};

const TABS = [
  { id: "week", label: "Lịch theo tuần" },
  { id: "list", label: "Danh sách ca" },
];

const VN_DAYS = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0 = Sun
  const diff = (day === 0 ? -6 : 1 - day);
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}
function fmtDate(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shiftKind(s: ShiftRow): ShiftKind {
  if (s.shift_type === "morning" || s.shift_type === "afternoon" || s.shift_type === "night") {
    return s.shift_type as ShiftKind;
  }
  const hour = parseInt((s.start_time || "06:00").slice(0, 2), 10);
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "night";
}

interface CellData { shifts: ShiftRow[]; kind: ShiftKind; }

function ShiftCell({ data }: { data: CellData }) {
  if (data.shifts.length === 0) {
    return (
      <div className="h-9 rounded-md border border-dashed border-border bg-bg2/40 flex items-center justify-center">
        <span className="text-[10px] text-t4">—</span>
      </div>
    );
  }
  const k = KIND_STYLES[data.kind];
  return (
    <div className={`h-9 rounded-md border border-border ${k.bg} flex items-center justify-between px-2 gap-1`}>
      <span className="text-[11px] font-bold text-t1">{data.shifts.length}</span>
      <div className="flex items-center -space-x-1">
        {data.shifts.slice(0, 3).map((s, i) => (
          <div key={s.id} title={s.staff_name ?? "?"} className="w-4 h-4 rounded-full bg-bg3 border border-bg1 text-[7px] flex items-center justify-center font-semibold text-t2">
            {(s.staff_name ?? "?").charAt(0).toUpperCase()}
          </div>
        ))}
        {data.shifts.length > 3 && <div className="ml-0.5 text-[9px] text-t3 font-mono">+{data.shifts.length - 3}</div>}
      </div>
    </div>
  );
}

function DonutSummary({ counts, total }: { counts: Record<ShiftKind, number>; total: number }) {
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);
  const segments = [
    { color: "hsl(var(--teal))", value: pct(counts.morning), label: "Ca sáng", count: counts.morning },
    { color: "hsl(var(--amber))", value: pct(counts.afternoon), label: "Ca chiều", count: counts.afternoon },
    { color: "hsl(var(--info))", value: pct(counts.night), label: "Ca đêm", count: counts.night },
  ];
  let acc = 0;
  const stops = segments.map((s) => { const start = acc; acc += s.value || 0.01; return `${s.color} ${start}% ${acc}%`; }).join(", ");
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-[88px] h-[88px] rounded-full shrink-0" style={{ background: total > 0 ? `conic-gradient(${stops})` : "hsl(var(--bg3))" }}>
        <div className="absolute inset-[10px] rounded-full bg-bg1 flex flex-col items-center justify-center">
          <div className="font-display text-lg font-extrabold leading-none">{total}</div>
          <div className="text-[8px] text-t4 mt-0.5">Tổng ca</div>
        </div>
      </div>
      <div className="space-y-1 flex-1 min-w-0">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
            <span className="text-t2 flex-1 truncate">{s.label}</span>
            <span className="font-mono font-semibold text-t1">{s.count}</span>
            <span className="text-t4 text-[9px]">({s.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarItem({ label, value, percent, color }: { label: string; value: number; percent: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="text-t2">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-semibold text-t1">{value}</span>
          <span className="text-t4 text-[9px]">({percent}%)</span>
        </div>
      </div>
      <div className="h-1 bg-bg3 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}

export default function WorkforceScreen() {
  const [activeTab, setActiveTab] = useState("week");
  const [shiftOpen, setShiftOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const stats = useWorkforceStats().data;

  const weekStart = useMemo(() => {
    const d = startOfWeek(new Date());
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return { date: d, label: VN_DAYS[d.getDay()], dateLabel: fmtDate(d), iso: toISODate(d) };
  }), [weekStart]);

  const weekEnd = weekDays[6].iso;

  const { data: shifts = [], isLoading } = useShifts({ week_start: toISODate(weekStart) });
  const weekShifts = useMemo(() => shifts.filter((s) => s.shift_date >= toISODate(weekStart) && s.shift_date <= weekEnd), [shifts, weekStart, weekEnd]);

  // Group by building_name (position)
  const positions = useMemo(() => {
    const groups = new Map<string, ShiftRow[][]>();
    for (const s of weekShifts) {
      const key = s.building_name || "Chưa gán toà";
      if (!groups.has(key)) groups.set(key, Array.from({ length: 7 }, () => [] as ShiftRow[]));
      const dayIdx = weekDays.findIndex((d) => d.iso === s.shift_date);
      if (dayIdx >= 0) groups.get(key)![dayIdx].push(s);
    }
    return Array.from(groups.entries()).map(([name, cells]) => ({
      name,
      cells: cells.map<CellData>((arr) => ({
        shifts: arr,
        kind: arr.length > 0 ? shiftKind(arr[0]) : "morning",
      })),
    }));
  }, [weekShifts, weekDays]);

  const dayTotals = useMemo(() => weekDays.map((_, di) => positions.reduce((sum, p) => sum + p.cells[di].shifts.length, 0)), [positions, weekDays]);

  const kindCounts = useMemo(() => {
    const c: Record<ShiftKind, number> = { morning: 0, afternoon: 0, night: 0 };
    for (const s of weekShifts) c[shiftKind(s)]++;
    return c;
  }, [weekShifts]);

  const totalShifts = weekShifts.length;
  const uniqueStaff = new Set(weekShifts.map((s) => s.staff_member_id)).size;
  const overtime = weekShifts.filter((s) => s.shift_type === "overtime").length;
  const pending = weekShifts.filter((s) => s.status === "pending" || s.status === "swap_requested").length;

  const kpis = [
    { label: "Tổng ca trong tuần", value: String(totalShifts), delta: `${positions.length} vị trí`, deltaType: "neutral" as const, color: "info" as const },
    { label: "Nhân sự đã phân", value: String(uniqueStaff), delta: stats ? `/${stats.totalStaff} người` : "", deltaType: "up" as const, color: "teal" as const },
    { label: "Ca hôm nay", value: String(stats?.todayShifts ?? 0), delta: "Đang chạy", deltaType: "neutral" as const, color: "purple" as const },
    { label: "Tăng ca", value: String(overtime), delta: totalShifts > 0 ? `${Math.round((overtime / totalShifts) * 100)}%` : "0%", deltaType: "up" as const, color: "amber" as const },
    { label: "Ca chờ duyệt", value: String(pending), delta: pending > 0 ? "Cần xử lý" : "Sạch", deltaType: pending > 0 ? "dn" as const : "neutral" as const, color: "amber" as const },
    { label: "Đang trực", value: String(stats?.onlineStaff ?? 0), delta: stats ? `${stats.totalStaff - stats.onlineStaff} offline` : "", deltaType: "neutral" as const, color: "teal" as const },
  ];

  const weekRangeLabel = `${weekDays[0].dateLabel} - ${weekDays[6].dateLabel}/${weekStart.getFullYear()}`;

  return (
    <div className="space-y-2">
      {/* Header context bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-bg1 text-[11px]">
          <span className="text-t3">Công ty:</span>
          <span className="font-semibold text-t1">Bảo vệ STOS</span>
          <ChevronDown className="w-3 h-3 text-t4" />
        </div>
        <div className="flex items-center gap-1 px-1 py-0.5 rounded-md border border-border bg-bg1 text-[11px]">
          <button onClick={() => setWeekOffset((w) => w - 1)} className="px-1.5 py-1 hover:bg-bg2 rounded text-t3">‹</button>
          <Calendar className="w-3.5 h-3.5 text-t3" />
          <span className="font-mono text-t1 px-1">{weekRangeLabel}</span>
          <button onClick={() => setWeekOffset((w) => w + 1)} className="px-1.5 py-1 hover:bg-bg2 rounded text-t3">›</button>
          {weekOffset !== 0 && (
            <button onClick={() => setWeekOffset(0)} className="px-1.5 py-1 hover:bg-bg2 rounded text-primary text-[10px]">Hôm nay</button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" variant="outline" className="h-7 text-[11px]"><History className="w-3.5 h-3.5 mr-1" />Lịch sử</Button>
          <Button size="sm" variant="outline" className="h-7 text-[11px]"><FileDown className="w-3.5 h-3.5 mr-1" />Xuất báo cáo</Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={() => setShiftOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Phân ca
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} deltaType={k.deltaType} color={k.color} />
        ))}
      </div>

      {/* Filters (visual only for now) */}
      <div className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.4fr_auto_auto] gap-1.5">
        <select className="h-8 px-2 text-[11px] rounded-md border border-border bg-bg1 text-t1">
          <option>Tất cả công trình</option>
        </select>
        <select className="h-8 px-2 text-[11px] rounded-md border border-border bg-bg1 text-t1">
          <option>Tất cả bộ phận</option>
        </select>
        <select className="h-8 px-2 text-[11px] rounded-md border border-border bg-bg1 text-t1">
          <option>Tất cả ca</option><option>Ca sáng</option><option>Ca chiều</option><option>Ca đêm</option>
        </select>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t4" />
          <input placeholder="Nhập tên, mã nhân viên..." className="w-full h-8 pl-7 pr-2 text-[11px] rounded-md border border-border bg-bg1 text-t1" />
        </div>
        <Button size="sm" variant="outline" className="h-8 text-[11px]"><Filter className="w-3.5 h-3.5 mr-1" />Bộ lọc</Button>
        <Button size="sm" variant="outline" className="h-8 text-[11px] px-2"><MoreHorizontal className="w-4 h-4" /></Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-border">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`relative py-2 text-[12px] font-medium transition-colors ${activeTab === t.id ? "text-primary" : "text-t3 hover:text-t1"}`}>
            {t.label}
            {activeTab === t.id && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-primary rounded-full" />}
          </button>
        ))}
      </div>

      <ShiftFormDialog open={shiftOpen} onOpenChange={setShiftOpen} />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-2">
        <CardPanel title="Lịch trực & Phân ca theo tuần">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1 min-w-[900px]">
              <thead>
                <tr>
                  <th className="text-left text-[10px] font-bold text-t4 uppercase tracking-wider px-2 pb-1 w-[200px]">Vị trí / Khu vực</th>
                  {weekDays.map((d, i) => (
                    <th key={i} className="text-center text-[10px] font-semibold text-t2 px-1 pb-1">
                      <div>{d.label}</div>
                      <div className="font-mono text-[9px] text-t4 font-normal">{d.dateLabel}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={8} className="text-center text-[11px] text-t4 py-6">Đang tải lịch...</td></tr>
                )}
                {!isLoading && positions.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-[11px] text-t4 py-6">Chưa có ca nào trong tuần này. Bấm "Phân ca" để tạo mới.</td></tr>
                )}
                {positions.map((p) => (
                  <tr key={p.name}>
                    <td className="px-2 align-middle">
                      <div className="flex items-start gap-1.5">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full ${KIND_STYLES[p.cells.find((c) => c.shifts.length > 0)?.kind ?? "morning"].dot}`} />
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold text-t1 truncate">{p.name}</div>
                          <div className="text-[9px] text-t4">{p.cells.reduce((s, c) => s + c.shifts.length, 0)} ca / tuần</div>
                        </div>
                      </div>
                    </td>
                    {p.cells.map((c, di) => (
                      <td key={di} className="px-0.5"><ShiftCell data={c} /></td>
                    ))}
                  </tr>
                ))}
                {positions.length > 0 && (
                  <tr>
                    <td className="px-2 pt-2 align-middle">
                      <div className="text-[11px] font-bold text-t1">Tổng ca / ngày</div>
                    </td>
                    {dayTotals.map((n, i) => (
                      <td key={i} className="px-0.5 pt-2 text-center">
                        <div className="font-mono text-[12px] font-bold text-t1">{n}</div>
                        <div className="text-[9px] font-semibold text-t4">{n > 0 ? "ca" : "—"}</div>
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3 px-2 pt-3 border-t border-border mt-2">
            {(Object.keys(KIND_STYLES) as ShiftKind[]).map((k) => (
              <div key={k} className="flex items-center gap-1.5 text-[10px] text-t3">
                <span className={`w-2 h-2 rounded-full ${KIND_STYLES[k].dot}`} />
                {KIND_STYLES[k].label}
              </div>
            ))}
          </div>
        </CardPanel>

        <div className="space-y-2">
          <CardPanel title="Tóm tắt phân ca"><DonutSummary counts={kindCounts} total={totalShifts} /></CardPanel>

          <CardPanel title="Tình trạng nhân sự">
            <div className="space-y-1.5">
              {(() => {
                const total = stats?.totalStaff ?? 0;
                const online = stats?.onlineStaff ?? 0;
                const offline = stats?.offlineStaff ?? 0;
                const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);
                return (
                  <>
                    <BarItem label="Đang trực" value={online} percent={pct(online)} color="hsl(var(--teal))" />
                    <BarItem label="Offline" value={offline} percent={pct(offline)} color="hsl(var(--danger))" />
                    <BarItem label="Đã phân ca tuần" value={uniqueStaff} percent={pct(uniqueStaff)} color="hsl(var(--info))" />
                    <BarItem label="Chưa phân ca" value={Math.max(0, total - uniqueStaff)} percent={pct(Math.max(0, total - uniqueStaff))} color="hsl(var(--amber))" />
                  </>
                );
              })()}
            </div>
          </CardPanel>

          <CardPanel title="Ca cần xử lý">
            <div className="space-y-1">
              {[
                { label: "Ca chờ duyệt", value: pending, color: "amber" as const },
                { label: "Tăng ca", value: overtime, color: "info" as const },
                { label: "Vị trí có ca", value: positions.length, color: "teal" as const },
                { label: "Tổng ca tuần", value: totalShifts, color: "purple" as const },
              ].map((it) => (
                <div key={it.label} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-bg2 cursor-pointer">
                  <span className="text-[11px] text-t2">{it.label}</span>
                  <Chip color={it.color}>{it.value}</Chip>
                </div>
              ))}
            </div>
          </CardPanel>

          <CardPanel title="Thao tác nhanh">
            <div className="space-y-0.5">
              {[
                { icon: Zap, label: "Phân ca nhanh" },
                { icon: Copy, label: "Sao chép ca tuần trước" },
                { icon: History, label: "Lịch sử thay đổi" },
                { icon: FileDown, label: "Xuất báo cáo" },
              ].map((it) => (
                <div key={it.label} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-bg2 cursor-pointer text-[11px] text-t2">
                  <it.icon className="w-3.5 h-3.5 text-t4" />
                  <span className="flex-1">{it.label}</span>
                  <ChevronDown className="w-3 h-3 -rotate-90 text-t4" />
                </div>
              ))}
            </div>
          </CardPanel>
        </div>
      </div>
    </div>
  );
}
