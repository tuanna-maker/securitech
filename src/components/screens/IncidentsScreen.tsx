import { useState, useMemo } from "react";
import KpiCard from "@/components/ui/KpiCard";
import CardPanel from "@/components/ui/CardPanel";
import { Chip } from "@/components/ui/StatusChip";
import { useIncidents, useIncidentTimeline, useIncidentStats, useCreateIncident, useUpdateIncidentStatus, type IncidentRow } from "@/features/incidents";
import { useBuildings } from "@/features/buildings";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const tabs = [
  { id: "active", label: "Đang xử lý" },
  { id: "all", label: "Tất cả sự cố" },
  { id: "stats", label: "Thống kê" },
];

const severityConfig: Record<string, { label: string; color: "danger" | "amber" | "info" | "purple"; dotClass: string }> = {
  critical: { label: "N.TRỌNG", color: "danger", dotClass: "bg-danger animate-blink" },
  high: { label: "CAO", color: "danger", dotClass: "bg-danger animate-blink" },
  medium: { label: "TB", color: "amber", dotClass: "bg-amber" },
  low: { label: "THẤP", color: "info", dotClass: "bg-info" },
};

const statusConfig: Record<string, { label: string; color: "amber" | "teal" | "danger" | "purple" | "info" }> = {
  new: { label: "Mới", color: "purple" },
  processing: { label: "Đang xử lý", color: "amber" },
  in_progress: { label: "Đang xử lý", color: "amber" },
  escalated: { label: "Leo thang", color: "danger" },
  resolved: { label: "Đã giải quyết", color: "teal" },
  closed: { label: "Đã đóng", color: "info" },
};

export default function IncidentsScreen() {
  const [activeTab, setActiveTab] = useState("active");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: incidentsData, isLoading } = useIncidents({
    status: activeTab === "active" ? undefined : undefined,
    severity: severityFilter !== "all" ? severityFilter : undefined,
  });
  const stats = useIncidentStats();
  const updateStatus = useUpdateIncidentStatus();
  const createIncident = useCreateIncident();
  const { data: buildingsData } = useBuildings();

  const allIncidents = incidentsData?.data ?? [];

  const displayIncidents = useMemo(() => {
    let list = allIncidents;
    if (activeTab === "active") {
      list = list.filter((i) => !["resolved", "closed"].includes(i.status));
    }
    if (severityFilter !== "all") {
      list = list.filter((i) => i.severity === severityFilter);
    }
    return list;
  }, [allIncidents, activeTab, severityFilter]);

  const selected = selectedId ? allIncidents.find((i) => i.id === selectedId) : displayIncidents[0];
  const { data: timeline } = useIncidentTimeline(selected?.id ?? null);

  const severityFilters = useMemo(() => {
    const counts = { all: allIncidents.length, high: 0, medium: 0, low: 0 };
    for (const inc of allIncidents) {
      if (inc.severity === "high" || inc.severity === "critical") counts.high++;
      else if (inc.severity === "medium") counts.medium++;
      else counts.low++;
    }
    return [
      { key: "all", label: `Tất cả (${counts.all})` },
      { key: "high", label: `Cao (${counts.high})` },
      { key: "medium", label: `Trung bình (${counts.medium})` },
      { key: "low", label: `Thấp (${counts.low})` },
    ];
  }, [allIncidents]);

  const handleResolve = (inc: IncidentRow) => {
    updateStatus.mutate({ id: inc.id, status: "resolved" }, {
      onSuccess: () => toast.success("Sự cố đã được giải quyết"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleEscalate = (inc: IncidentRow) => {
    updateStatus.mutate({ id: inc.id, status: "escalated" }, {
      onSuccess: () => toast.success("Đã leo thang sự cố"),
      onError: (err) => toast.error(err.message),
    });
  };

  const s = stats.data;

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-2">
        <KpiCard label="Sự cố hôm nay" value={s?.todayCount ?? 0} delta={`${s?.highCount ?? 0} mức cao`} deltaType={s?.highCount ? "dn" : undefined} color="danger" />
        <KpiCard label="Đang xử lý" value={s?.activeCount ?? 0} delta={`${s?.highCount ?? 0} mức cao`} color="amber" />
        <KpiCard label="Phản hồi TB" value={s?.avgResponseMinutes ?? 0} valueSuffix=" phút" delta="tháng này" color="teal" />
        <KpiCard label="Đã giải quyết (tháng)" value={s?.resolvedMonth ?? 0} delta="tháng này" deltaType="up" color="info" />
      </div>

      {/* Tabs */}
      <div className="flex gap-[1px] bg-bg2 rounded-md p-[1.5px] mb-2 border border-border">
        {tabs.map((tab) => (
          <div key={tab.id} onClick={() => { setActiveTab(tab.id); setSelectedId(null); }}
            className={`flex-1 py-1 rounded-[3px] text-center cursor-pointer text-[10px] transition-all
              ${activeTab === tab.id ? "bg-bg4 text-t1 font-semibold shadow-sm" : "text-t3 hover:text-t2"}`}>
            {tab.label}
          </div>
        ))}
      </div>

      {(activeTab === "active" || activeTab === "all") && (
        <>
          <div className="flex gap-1 mb-2 flex-wrap">
            {severityFilters.map((f) => (
              <button key={f.key} onClick={() => { setSeverityFilter(f.key); setSelectedId(null); }}
                className={`px-2 py-[3px] rounded text-[9px] cursor-pointer transition-all border
                  ${severityFilter === f.key ? "bg-bg3 text-t1 border-border-strong font-semibold" : "bg-transparent text-t4 border-border hover:text-t2"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : displayIncidents.length === 0 ? (
            <div className="text-center py-12 text-t4 text-sm">Không có sự cố nào</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-2">
              <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-0.5">
                {displayIncidents.map((inc) => {
                  const sev = severityConfig[inc.severity] ?? severityConfig.medium;
                  const stat = statusConfig[inc.status] ?? statusConfig.new;
                  const isSelected = selected?.id === inc.id;
                  const time = new Date(inc.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={inc.id} onClick={() => setSelectedId(inc.id)}
                      className={`p-2 rounded-md border cursor-pointer transition-all
                        ${isSelected ? "border-teal/30 bg-teal-subtle" : "border-border bg-bg1 hover:border-border-strong hover:bg-bg2"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${sev.dotClass}`} />
                          <span className="font-mono text-[9px] text-t4">{inc.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex gap-1">
                          <Chip color={sev.color}>{sev.label}</Chip>
                          <Chip color={stat.color}>{stat.label}</Chip>
                        </div>
                      </div>
                      <div className="text-[11px] font-semibold mb-0.5 leading-tight">{inc.type}</div>
                      <div className="text-[9px] text-t3 mb-1">{inc.building_name ?? "—"}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-t4 font-mono">{time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selected && (
                <div className="bg-bg1 border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-bg2/50">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${(severityConfig[selected.severity] ?? severityConfig.medium).dotClass}`} />
                      <span className="text-[11px] font-bold font-mono">{selected.id.slice(0, 8)}</span>
                      <span className="text-[10px] text-t2 ml-1">{selected.type}</span>
                    </div>
                    <div className="flex gap-1">
                      <Chip color={(severityConfig[selected.severity] ?? severityConfig.medium).color}>{(severityConfig[selected.severity] ?? severityConfig.medium).label}</Chip>
                      <Chip color={(statusConfig[selected.status] ?? statusConfig.new).color}>{(statusConfig[selected.status] ?? statusConfig.new).label}</Chip>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 mb-3">
                      {[
                        { label: "Vị trí", value: selected.building_name ?? "—" },
                        { label: "Loại", value: selected.type },
                        { label: "Mức độ", value: selected.severity === "critical" ? "Nghiêm trọng" : selected.severity === "high" ? "Cao" : selected.severity === "medium" ? "Trung bình" : "Thấp" },
                        { label: "Thời gian", value: new Date(selected.created_at).toLocaleString("vi-VN"), mono: true },
                      ].map((item, i) => (
                        <div key={i} className="bg-bg2 px-2 py-1.5 rounded">
                          <div className="text-[8px] text-t4 uppercase tracking-wider">{item.label}</div>
                          <div className={`text-[10px] mt-0.5 ${item.mono ? "font-mono text-t2" : "font-medium text-t1"}`}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {selected.description && (
                      <div className="mb-3">
                        <div className="text-[8px] font-bold text-t4 uppercase tracking-wider mb-1">Mô tả</div>
                        <div className="text-[10px] text-t2 bg-bg2 p-2 rounded">{selected.description}</div>
                      </div>
                    )}

                    <div className="mb-3">
                      <div className="text-[8px] font-bold text-t4 uppercase tracking-wider mb-1">Mức độ nghiêm trọng</div>
                      <div className="flex gap-0.5">
                        {(["low", "medium", "high"] as const).map((sev) => (
                          <div key={sev} className={`flex-1 h-1.5 rounded-full transition-all ${
                            selected.severity === "high" || selected.severity === "critical" ? "bg-danger" :
                            selected.severity === "medium" && sev !== "high" ? "bg-amber" :
                            selected.severity === "low" && sev === "low" ? "bg-info" :
                            "bg-bg3"
                          }`} />
                        ))}
                      </div>
                      <div className="flex justify-between mt-0.5">
                        <span className="text-[7px] text-t4">Thấp</span>
                        <span className="text-[7px] text-t4">Trung bình</span>
                        <span className="text-[7px] text-t4">Cao</span>
                      </div>
                    </div>

                    <div className="text-[8px] font-bold text-t4 uppercase tracking-wider mb-1.5">Tiến trình xử lý</div>
                    {timeline && timeline.length > 0 ? (
                      <div className="relative pl-4">
                        <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border" />
                        {timeline.map((item, i) => (
                          <div key={item.id} className="relative mb-2 last:mb-0">
                            <div className={`absolute -left-[11px] top-[2px] w-1.5 h-1.5 rounded-full border border-bg1 ${
                              item.new_status === "resolved" ? "bg-teal" :
                              item.new_status === "escalated" ? "bg-danger" :
                              i === 0 ? "bg-danger" : "bg-amber"
                            }`} />
                            <div className="flex items-start gap-1.5">
                              <span className="font-mono text-[9px] text-t4 shrink-0 w-12">
                                {new Date(item.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              <span className="text-[10px] leading-snug text-t2">{item.notes || item.action}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[9px] text-t4 py-2">Chưa có tiến trình</div>
                    )}

                    <div className="flex gap-1.5 mt-3 pt-2 border-t border-border">
                      {selected.status !== "resolved" && selected.status !== "closed" && (
                        <>
                          <button onClick={() => handleResolve(selected)}
                            disabled={updateStatus.isPending}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 rounded bg-teal text-bg0 text-[9px] font-semibold cursor-pointer hover:brightness-90 disabled:opacity-50">
                            {updateStatus.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                            Giải quyết
                          </button>
                          <button onClick={() => handleEscalate(selected)}
                            disabled={updateStatus.isPending}
                            className="flex items-center gap-1 px-2 py-1 rounded border border-danger/30 text-danger text-[9px] cursor-pointer hover:bg-danger-muted disabled:opacity-50">
                            Leo thang
                          </button>
                        </>
                      )}
                      <button className="flex items-center gap-1 px-2 py-1 rounded border border-border text-t3 text-[9px] cursor-pointer hover:border-border-strong hover:text-t2">
                        Xuất báo cáo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === "stats" && (
        <div className="grid grid-cols-2 gap-1.5">
          <CardPanel title="Tổng hợp sự cố">
            <div className="text-center py-4">
              <div className="font-mono text-3xl font-bold text-primary">{s?.todayCount ?? 0}</div>
              <div className="text-[10px] text-t4 mt-1">sự cố hôm nay</div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-bg2 p-2 rounded">
                  <div className="font-mono text-lg font-bold text-danger">{s?.highCount ?? 0}</div>
                  <div className="text-[8px] text-t4">Mức cao</div>
                </div>
                <div className="bg-bg2 p-2 rounded">
                  <div className="font-mono text-lg font-bold text-amber">{s?.activeCount ?? 0}</div>
                  <div className="text-[8px] text-t4">Đang xử lý</div>
                </div>
                <div className="bg-bg2 p-2 rounded">
                  <div className="font-mono text-lg font-bold text-teal">{s?.resolvedMonth ?? 0}</div>
                  <div className="text-[8px] text-t4">Đã giải quyết</div>
                </div>
              </div>
            </div>
          </CardPanel>

          <CardPanel title="Thời gian phản hồi">
            <div className="bg-bg2 p-2.5 rounded-md text-center">
              <div className="text-[8px] font-bold text-t4 uppercase tracking-wider mb-1">Trung bình</div>
              <div className="font-mono text-2xl font-bold text-teal">{s?.avgResponseMinutes ?? 0} phút</div>
              <div className="text-[8px] text-t4 mt-1">tháng này</div>
            </div>
          </CardPanel>
        </div>
      )}
    </div>
  );
}
