import { useState, useMemo } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientFormDialog from "@/components/crm/ClientFormDialog";
import KpiCard from "@/components/ui/KpiCard";
import CardPanel from "@/components/ui/CardPanel";
import { Chip } from "@/components/ui/StatusChip";
import { useClients, useClientBuildings, usePipelineDeals, useClientStats, useDeleteClient, clientStatusConfig, contractStatusConfig, typeLabel, pipelineStages } from "@/features/crm";
import { toast } from "sonner";
import type { Database } from "@/lib/db";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ClientStatus = Database["public"]["Enums"]["client_status"];
type ContractStatusEnum = Database["public"]["Enums"]["contract_status"];
type BuildingStatus = Database["public"]["Enums"]["building_status"];

const tabs = [
  { id: "clients", label: "Khách hàng" },
  { id: "pipeline", label: "Cơ hội kinh doanh" },
  { id: "contracts", label: "Hợp đồng" },
  { id: "stats", label: "Phân tích" },
];

const statusColor: Record<BuildingStatus, "teal" | "amber" | "danger"> = { normal: "teal", warning: "amber", critical: "danger" };
const statusLabel: Record<BuildingStatus, string> = { normal: "Bình thường", warning: "Cảnh báo", critical: "Nghiêm trọng" };

export default function CRMScreen() {
  const [activeTab, setActiveTab] = useState("clients");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"all" | ClientStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "bql" | "owner">("all");
  const [addOpen, setAddOpen] = useState(false);

  const { data: clientsData, isLoading } = useClients({ status: statusFilter, type: typeFilter });
  const { data: stats } = useClientStats();
  const { data: deals = [] } = usePipelineDeals();
  const deleteClient = useDeleteClient();

  const clients = clientsData?.data || [];
  const selected = clients[selectedIdx] || clients[0];

  const { data: selectedBuildings = [] } = useClientBuildings(selected?.id);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-teal" /></div>;
  }

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-3">
        <KpiCard label="Tổng khách hàng" value={stats?.total || 0} delta={`${stats?.active || 0} đang hợp tác`} deltaType="up" color="teal" />
        <KpiCard label="Doanh thu / tháng" value={stats?.totalValue || 0} valueSuffix="tr" delta="+12% vs Q trước" deltaType="up" color="teal" />
        <KpiCard label="Bảo vệ triển khai" value={stats?.totalGuards || 0} delta={`${stats?.active || 0} dự án`} color="info" />
        <KpiCard label="Hài lòng TB" value={(stats?.avgSatisfaction || 0).toFixed(1)} valueSuffix="/5" color={Number(stats?.avgSatisfaction) >= 4.5 ? "teal" : "amber"} />
        <KpiCard label="Cơ hội KD" value={deals.length} delta={`${Math.round(deals.reduce((s, d) => s + (d.value * d.probability) / 100, 0))}tr dự kiến`} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-[11.5px] cursor-pointer transition-all border whitespace-nowrap
              ${activeTab === t.id ? "bg-bg3 text-t1 border-border-strong font-semibold" : "text-t2 border-border hover:text-t1 hover:bg-bg2"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ CLIENTS TAB ═══ */}
      {activeTab === "clients" && (
        <div>
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <span className="text-[10px] text-t3 uppercase tracking-wider mr-1">Lọc:</span>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as typeof typeFilter); setSelectedIdx(0); }}
              className="bg-bg2 border border-border rounded-md px-2 py-1 text-[11px] text-t1 outline-none cursor-pointer">
              <option value="all">Tất cả loại</option>
              <option value="bql">Ban quản lý</option>
              <option value="owner">Chủ đầu tư</option>
            </select>
            <div className="flex gap-1">
              {(["all", "active", "negotiating", "prospect", "churned"] as const).map((s) => (
                <button key={s} onClick={() => { setStatusFilter(s); setSelectedIdx(0); }}
                  className={`px-2 py-1 rounded-md text-[10.5px] border transition-all cursor-pointer
                    ${statusFilter === s ? "bg-bg3 text-t1 border-border-strong" : "bg-transparent text-t3 border-border hover:text-t1"}`}>
                  {s === "all" ? `Tất cả` : clientStatusConfig[s]?.label || s}
                </button>
              ))}
            </div>
            <span className="ml-auto text-[10px] text-t3">{clients.length} khách hàng</span>
            <Button size="sm" className="h-7 text-[11px]" onClick={() => setAddOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Thêm KH
            </Button>
          </div>
          <ClientFormDialog open={addOpen} onOpenChange={setAddOpen} />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-2" style={{ minHeight: 420 }}>
            <div className="lg:col-span-2 space-y-1.5 overflow-y-auto max-h-[500px] pr-1">
              {clients.map((c, i) => {
                const sc = clientStatusConfig[c.status as ClientStatus] || { label: c.status, color: "info" as const };
                const isSelected = selectedIdx === i;
                return (
                  <div key={c.id} onClick={() => setSelectedIdx(i)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all
                      ${isSelected ? "bg-teal-subtle border-border-accent" : "bg-bg1 border-border hover:bg-bg2"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11.5px] font-semibold truncate pr-2">{c.name}</span>
                      <Chip color={sc.color}>{sc.label}</Chip>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] text-t3">
                      <span className="px-1.5 py-0.5 bg-bg3 rounded text-[9px]">{typeLabel[c.type] || c.type}</span>
                      <span>{c.contact_person}</span>
                    </div>
                    {c.status === "active" && (
                      <div className="flex items-center justify-between mt-1.5 text-[10.5px]">
                        <span className="text-t3">{c.contract_value}tr/tháng · {c.guards_count} BV</span>
                        <span className={`font-mono font-semibold ${c.sla >= 95 ? "text-teal" : c.sla >= 90 ? "text-amber" : "text-danger"}`}>
                          SLA {c.sla}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              {clients.length === 0 && <div className="text-xs text-t3 text-center py-8">Chưa có khách hàng</div>}
            </div>

            {selected && (
              <div className="lg:col-span-3 bg-bg1 border border-border rounded-lg p-4 overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-[15px] font-display font-bold">{selected.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-bg3 rounded text-[10px] text-t2">{typeLabel[selected.type] || selected.type}</span>
                      <Chip color={clientStatusConfig[selected.status as ClientStatus]?.color || "info"}>
                        {clientStatusConfig[selected.status as ClientStatus]?.label || selected.status}
                      </Chip>
                      {selected.contract_status !== "draft" && (
                        <Chip color={contractStatusConfig[selected.contract_status as ContractStatusEnum]?.color || "info"}>
                          HĐ: {contractStatusConfig[selected.contract_status as ContractStatusEnum]?.label || selected.contract_status}
                        </Chip>
                      )}
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" className="h-7 text-[10px]"
                    onClick={() => { if (confirm("Xóa khách hàng này?")) deleteClient.mutate(selected.id, { onSuccess: () => { toast.success("Đã xóa"); setSelectedIdx(0); } }); }}>
                    Xóa KH
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="bg-bg2 rounded-lg p-3">
                    <div className="text-[9px] text-t4 uppercase tracking-wider mb-2">Thông tin liên hệ</div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-t3 w-16">Người LH:</span>
                        <span className="font-medium">{selected.contact_person || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-t3 w-16">SĐT:</span>
                        <span className="text-teal">{selected.phone || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-t3 w-16">Email:</span>
                        <span className="text-teal truncate">{selected.email || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg2 rounded-lg p-3">
                    <div className="text-[9px] text-t4 uppercase tracking-wider mb-2">Hợp đồng</div>
                    {selected.contract_value > 0 ? (
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-t3">Giá trị:</span>
                          <span className="font-display font-bold text-teal text-[14px]">{selected.contract_value}tr/tháng</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-t3">Thời hạn:</span>
                          <span>{selected.contract_start || "—"} – {selected.contract_end || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-t3">Bảo vệ:</span>
                          <span className="font-semibold">{selected.guards_count} người</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-t3">SLA:</span>
                          <span className={`font-mono font-semibold ${selected.sla >= 95 ? "text-teal" : "text-amber"}`}>{selected.sla}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-t3">Chưa có hợp đồng</div>
                    )}
                  </div>
                </div>

                {selectedBuildings.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[9px] text-t4 uppercase tracking-wider mb-2">Tòa nhà đang quản lý ({selectedBuildings.length})</div>
                    <div className="space-y-1.5">
                      {selectedBuildings.map((b: any) => (
                        <div key={b.id} className="flex items-center gap-3 p-2.5 bg-bg2 border border-border/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-medium text-t1 truncate">{b.name}</span>
                              <Chip color={statusColor[b.status as BuildingStatus] || "info"}>{statusLabel[b.status as BuildingStatus] || b.status}</Chip>
                            </div>
                            <div className="text-[10px] text-t3 mt-0.5">{b.region} · {b.address}</div>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] shrink-0">
                            <div className="text-center">
                              <div className="font-mono font-semibold text-t1">{b.staff_online}/{b.staff_total}</div>
                              <div className="text-t4">Nhân sự</div>
                            </div>
                            <div className="text-center">
                              <div className={`font-mono font-semibold ${b.sla_percent < 90 ? "text-danger" : "text-teal"}`}>{b.sla_percent}%</div>
                              <div className="text-t4">SLA</div>
                            </div>
                            <div className="text-center">
                              <div className="font-mono font-semibold text-t1">{b.incidents_today}</div>
                              <div className="text-t4">Sự cố</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.satisfaction > 0 && (
                  <div className="mb-4">
                    <div className="text-[9px] text-t4 uppercase tracking-wider mb-2">Mức độ hài lòng</div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-[16px] ${star <= selected.satisfaction ? "opacity-100" : "opacity-20"}`}>⭐</span>
                      ))}
                      <span className="text-[12px] font-mono ml-2 text-t2">{selected.satisfaction}/5</span>
                    </div>
                  </div>
                )}

                {selected.notes && (
                  <div className="mb-4">
                    <div className="text-[9px] text-t4 uppercase tracking-wider mb-2">Ghi chú</div>
                    <div className="text-[11.5px] text-t2 bg-bg2 rounded-lg p-2.5 border border-border/50">{selected.notes}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ PIPELINE TAB ═══ */}
      {activeTab === "pipeline" && (
        <div>
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <div className="text-[11px] text-t3">
              Tổng giá trị: <span className="font-display font-bold text-teal text-[14px]">{deals.reduce((s, d) => s + d.value, 0).toLocaleString()}tr</span>
            </div>
            <div className="text-[11px] text-t3">
              Dự kiến: <span className="font-display font-bold text-amber text-[14px]">{Math.round(deals.reduce((s, d) => s + (d.value * d.probability) / 100, 0)).toLocaleString()}tr</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {pipelineStages.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage.id);
              const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
              return (
                <div key={stage.id} className="bg-bg1 border border-border rounded-lg overflow-hidden">
                  <div className="px-3 py-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                      <span className="text-[11px] font-semibold">{stage.label}</span>
                      <span className="ml-auto text-[10px] text-t3 font-mono">{stageDeals.length}</span>
                    </div>
                    <div className="text-[10px] text-t3 mt-0.5">{stageValue > 0 ? `${stageValue.toLocaleString()}tr` : "—"}</div>
                  </div>
                  <div className="p-2 space-y-1.5 min-h-[100px]">
                    {stageDeals.map((deal) => (
                      <div key={deal.id} className="bg-bg2 border border-border/50 rounded-lg p-2.5">
                        <div className="text-[11px] font-medium mb-1">{deal.name}</div>
                        <div className="flex items-center justify-between text-[10px] text-t3">
                          <span className="font-mono font-semibold text-teal">{deal.value}tr</span>
                          <span>{deal.probability}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[9.5px] text-t3 mt-1">
                          <span>{deal.contact}</span>
                          <span>{deal.days_in_stage}d</span>
                        </div>
                        <div className="h-1 bg-bg4 rounded-full mt-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${stage.color}`} style={{ width: `${deal.probability}%` }} />
                        </div>
                      </div>
                    ))}
                    {stageDeals.length === 0 && <div className="text-[10px] text-t3 text-center py-4">Trống</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ CONTRACTS TAB ═══ */}
      {activeTab === "contracts" && (
        <CardPanel title="Danh sách hợp đồng">
          <div className="overflow-x-auto">
            <table className="w-full text-[11.5px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-t3 font-medium">Khách hàng</th>
                  <th className="text-left py-2 px-2 text-t3 font-medium hidden sm:table-cell">Loại</th>
                  <th className="text-center py-2 px-2 text-t3 font-medium">Giá trị</th>
                  <th className="text-center py-2 px-2 text-t3 font-medium hidden md:table-cell">Thời hạn</th>
                  <th className="text-center py-2 px-2 text-t3 font-medium">BV</th>
                  <th className="text-center py-2 px-2 text-t3 font-medium hidden md:table-cell">SLA</th>
                  <th className="text-center py-2 px-2 text-t3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {clients.filter((c) => c.contract_value > 0 || c.contract_status !== "draft").map((c) => {
                  const cs = contractStatusConfig[c.contract_status as ContractStatusEnum] || { label: c.contract_status, color: "info" as const };
                  return (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-bg2 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-[10px] text-t3">{c.contact_person}</div>
                      </td>
                      <td className="py-2.5 px-2 text-t3 hidden sm:table-cell">{typeLabel[c.type] || c.type}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-semibold text-teal">{c.contract_value}tr</td>
                      <td className="py-2.5 px-2 text-center text-t3 text-[10.5px] hidden md:table-cell">
                        {c.contract_start ? `${c.contract_start} – ${c.contract_end}` : "—"}
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono">{c.guards_count || "—"}</td>
                      <td className="py-2.5 px-2 text-center font-mono hidden md:table-cell">
                        <span className={c.sla >= 95 ? "text-teal" : c.sla >= 90 ? "text-amber" : "text-danger"}>
                          {c.sla > 0 ? `${c.sla}%` : "—"}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center"><Chip color={cs.color}>{cs.label}</Chip></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardPanel>
      )}

      {/* ═══ STATS TAB ═══ */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <CardPanel title="Phân bổ khách hàng">
            <div className="space-y-2.5">
              {(["active", "negotiating", "prospect", "churned"] as ClientStatus[]).map((s) => {
                const count = stats?.byStatus?.[s] || 0;
                const pct = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                const cfg = clientStatusConfig[s];
                return (
                  <div key={s}>
                    <div className="flex justify-between text-[10.5px] text-t2 mb-0.5">
                      <span>{cfg.label}</span>
                      <span className="font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-bg3 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cfg.color === "teal" ? "bg-teal" : cfg.color === "amber" ? "bg-amber" : cfg.color === "info" ? "bg-info" : "bg-danger"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardPanel>

          <CardPanel title="Top khách hàng (doanh thu)">
            <div className="space-y-2">
              {[...clients].filter((c) => c.contract_value > 0).sort((a, b) => b.contract_value - a.contract_value).slice(0, 5).map((c, i) => (
                <div key={c.id} className="flex items-center gap-2 py-1 border-b border-border/30 last:border-0">
                  <span className="text-[12px] w-5 text-center">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium truncate">{c.name}</div>
                    <div className="text-[9.5px] text-t3">{c.guards_count} BV</div>
                  </div>
                  <span className="text-[12px] font-mono font-bold text-teal shrink-0">{c.contract_value}tr</span>
                </div>
              ))}
            </div>
          </CardPanel>

          <CardPanel title="Cảnh báo & Hành động">
            <div className="space-y-2">
              {clients.filter((c) => c.contract_status === "expiring").map((c) => (
                <div key={c.id} className="flex items-center gap-2 p-2 bg-amber-subtle rounded-lg border border-amber/20">
                  <span className="text-[14px]">⚠️</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium">{c.name}</div>
                    <div className="text-[10px] text-t3">HĐ hết hạn: {c.contract_end}</div>
                  </div>
                </div>
              ))}
              {clients.filter((c) => c.contract_status === "expired" && c.status !== "churned").map((c) => (
                <div key={c.id} className="flex items-center gap-2 p-2 bg-danger-subtle rounded-lg border border-danger/20">
                  <span className="text-[14px]">🔴</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium">{c.name}</div>
                    <div className="text-[10px] text-t3">HĐ đã hết hạn</div>
                  </div>
                </div>
              ))}
              {clients.filter((c) => c.satisfaction > 0 && c.satisfaction <= 3).map((c) => (
                <div key={c.id} className="flex items-center gap-2 p-2 bg-amber-subtle rounded-lg border border-amber/20">
                  <span className="text-[14px]">📉</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium">{c.name}</div>
                    <div className="text-[10px] text-t3">Hài lòng thấp: {c.satisfaction}/5</div>
                  </div>
                </div>
              ))}
              {clients.filter((c) => c.contract_status === "expiring" || (c.contract_status === "expired" && c.status !== "churned") || (c.satisfaction > 0 && c.satisfaction <= 3)).length === 0 && (
                <div className="text-xs text-t3 text-center py-4">Không có cảnh báo</div>
              )}
            </div>
          </CardPanel>
        </div>
      )}
    </div>
  );
}
