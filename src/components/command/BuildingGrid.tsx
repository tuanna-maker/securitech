import { useState, useMemo } from "react";
import { useBuildings, type BuildingRow } from "@/features/buildings";
import { Chip } from "@/components/ui/StatusChip";
import { Loader2 } from "lucide-react";

type BuildingStatus = "normal" | "warning" | "critical";

interface Props {
  onSelectBuilding: (b: BuildingRow) => void;
  selectedId?: string;
}

const statusSort: Record<BuildingStatus, number> = { critical: 0, warning: 1, normal: 2 };
const statusChip: Record<BuildingStatus, { label: string; color: "danger" | "amber" | "teal" }> = {
  critical: { label: "Nghiêm trọng", color: "danger" },
  warning: { label: "Cảnh báo", color: "amber" },
  normal: { label: "Bình thường", color: "teal" },
};

const PAGE_SIZE = 12;

export default function BuildingGrid({ onSelectBuilding, selectedId }: Props) {
  const { data: buildingsData, isLoading } = useBuildings({ limit: 1000 });
  const buildings = buildingsData?.data ?? [];

  const [regionFilter, setRegionFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState<"all" | BuildingStatus>("all");
  const [page, setPage] = useState(1);

  const allRegions = useMemo(() => [...new Set(buildings.map((b) => b.region).filter(Boolean))].sort() as string[], [buildings]);
  const allCompanies = useMemo(() => [...new Set(buildings.map((b) => b.management_company).filter(Boolean))].sort() as string[], [buildings]);

  const filtered = useMemo(() => {
    return buildings
      .filter((b) => regionFilter === "all" || b.region === regionFilter)
      .filter((b) => companyFilter === "all" || b.management_company === companyFilter)
      .filter((b) => riskFilter === "all" || b.status === riskFilter)
      .sort((a, b) => statusSort[a.status] - statusSort[b.status]);
  }, [buildings, regionFilter, companyFilter, riskFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (setter: (v: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <span className="text-[10px] text-t3 uppercase tracking-wider mr-1">Lọc:</span>
        <select value={regionFilter} onChange={(e) => handleFilterChange(setRegionFilter, e.target.value)}
          className="bg-bg2 border border-border rounded-md px-2 py-1 text-[11px] text-t1 outline-none cursor-pointer">
          <option value="all">Tất cả khu vực</option>
          {allRegions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={companyFilter} onChange={(e) => handleFilterChange(setCompanyFilter, e.target.value)}
          className="bg-bg2 border border-border rounded-md px-2 py-1 text-[11px] text-t1 outline-none cursor-pointer">
          <option value="all">Tất cả BQL</option>
          {allCompanies.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex gap-1">
          {(["all", "critical", "warning", "normal"] as const).map((s) => (
            <button key={s} onClick={() => { setRiskFilter(s); setPage(1); }}
              className={`px-2 py-1 rounded-md text-[10.5px] border transition-all cursor-pointer
                ${riskFilter === s ? "bg-bg3 text-t1 border-border-strong" : "bg-transparent text-t3 border-border hover:text-t1"}`}>
              {s === "all" ? `Tất cả (${buildings.length})` : `${statusChip[s].label} (${buildings.filter((b) => b.status === s).length})`}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[10px] text-t3">{filtered.length} tòa nhà</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pr-1">
        {paged.map((b, idx) => {
          const sc = statusChip[b.status];
          const isSelected = selectedId === b.id;
          return (
            <div key={b.id} onClick={() => onSelectBuilding(b)}
              className={`bg-bg1 border rounded-lg p-2.5 cursor-pointer transition-all duration-200 relative overflow-hidden animate-scale-in group
                ${isSelected ? "border-border-strong bg-bg2 -translate-y-0.5 shadow-[0_4px_12px_-4px_hsl(var(--teal)/0.1)]" : "border-border hover:border-border-strong hover:bg-bg2 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_-4px_hsl(var(--teal)/0.08)]"}`}
              style={{ animationDelay: `${idx * 40}ms` }}>
              <div className={`absolute top-0 left-0 right-0 h-[2px] ${sc.color === "danger" ? "bg-danger" : sc.color === "amber" ? "bg-amber" : "bg-teal"}`} />
              <div className="flex items-start justify-between mb-1.5">
                <div className="text-[11.5px] font-semibold leading-tight pr-1 line-clamp-1">{b.name}</div>
                <Chip color={sc.color}>{sc.label}</Chip>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10.5px]">
                <div className="text-t3">Nhân viên</div>
                <div className={`font-mono text-right ${b.staff_total > 0 && b.staff_online / b.staff_total < 0.7 ? "text-danger" : "text-t1"}`}>
                  {b.staff_online}/{b.staff_total}
                </div>
                <div className="text-t3">Sự cố</div>
                <div className={`font-mono text-right ${b.critical_incidents > 0 ? "text-danger font-semibold" : "text-t1"}`}>
                  {b.incidents_today}{b.critical_incidents > 0 && ` (${b.critical_incidents} nghiêm trọng)`}
                </div>
                <div className="text-t3">Tuần tra</div>
                <div className="text-right">
                  <div className="h-1 bg-bg3 rounded-full overflow-hidden inline-block w-12 align-middle mr-1">
                    <div className={`h-full rounded-full ${b.patrol_completion > 85 ? "bg-teal" : b.patrol_completion > 70 ? "bg-amber" : "bg-danger"}`}
                      style={{ width: `${b.patrol_completion}%` }} />
                  </div>
                  <span className="font-mono">{b.patrol_completion}%</span>
                </div>
                <div className="text-t3">SLA</div>
                <div className={`font-mono text-right font-semibold ${b.sla_percent >= 95 ? "text-teal" : b.sla_percent >= 90 ? "text-amber" : "text-danger"}`}>
                  {b.sla_percent}%
                </div>
              </div>
            </div>
          );
        })}
        {paged.length === 0 && (
          <div className="col-span-full text-center py-8 text-t3 text-sm">
            {buildings.length === 0 ? "Chưa có tòa nhà nào" : "Không tìm thấy"}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-2 py-1 rounded-md text-[10.5px] border border-border text-t2 hover:text-t1 hover:bg-bg2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
            ‹ Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-7 h-7 rounded-md text-[10.5px] border transition-all cursor-pointer
                ${page === p ? "bg-bg3 text-t1 border-border-strong font-semibold" : "border-border text-t3 hover:text-t1 hover:bg-bg2"}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-2 py-1 rounded-md text-[10.5px] border border-border text-t2 hover:text-t1 hover:bg-bg2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors">
            Sau ›
          </button>
        </div>
      )}
    </div>
  );
}
