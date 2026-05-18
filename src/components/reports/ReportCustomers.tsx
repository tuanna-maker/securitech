import { Loader2 } from "lucide-react";
import CardPanel from "@/components/ui/CardPanel";
import { Chip } from "@/components/ui/StatusChip";
import { useReportCustomers } from "@/features/reports";

export default function ReportCustomers() {
  const { data, isLoading } = useReportCustomers();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-teal" /></div>;
  }

  const clients = data?.clients || [];

  return (
    <div className="space-y-3.5">
      {/* Customer KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { label: "Tổng khách hàng", value: String(data?.total || 0), color: "text-info" },
          { label: "Tỷ lệ giữ chân", value: `${data?.retentionRate || 0}%`, color: "text-green" },
          { label: "Hài lòng trung bình", value: `${data?.avgSatisfaction || 0}/5`, color: "text-teal" },
          { label: "Sắp hết hạn HĐ", value: String(data?.expiring || 0), color: "text-amber" },
        ].map((k) => (
          <div key={k.label} className="bg-bg1 border border-border rounded-xl px-4 py-3">
            <div className="text-xs text-t2 uppercase tracking-wider font-semibold mb-1">{k.label}</div>
            <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Customer list */}
        <CardPanel title="Danh sách khách hàng" className="lg:col-span-2">
          <div className="mt-2 space-y-1">
            <div className="grid grid-cols-[1fr_60px_80px_80px_60px] gap-2 text-[10px] text-t3 font-medium px-2 pb-1 border-b border-border">
              <span>Khách hàng</span>
              <span className="text-center">Loại</span>
              <span className="text-center">Trạng thái</span>
              <span className="text-center">DT (tr)</span>
              <span className="text-center">CSAT</span>
            </div>
            {clients.length === 0 && <div className="text-xs text-t3 text-center py-4">Chưa có dữ liệu</div>}
            {clients.map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_60px_80px_80px_60px] gap-2 items-center px-2 py-2 rounded hover:bg-bg2 transition-colors">
                <span className="text-xs text-t1 truncate font-medium">{c.name}</span>
                <div className="flex justify-center">
                  <Chip color={c.type === "bql" ? "info" : "purple"}>{c.type === "bql" ? "BQL" : "CĐT"}</Chip>
                </div>
                <div className="flex justify-center">
                  <Chip color={c.status === "active" ? "green" : c.status === "negotiating" ? "amber" : c.status === "prospect" ? "info" : "danger"}>
                    {c.status === "active" ? "Đang HĐ" : c.status === "negotiating" ? "Đàm phán" : c.status === "prospect" ? "Tiềm năng" : "Đã rời"}
                  </Chip>
                </div>
                <span className="text-xs text-teal text-center font-semibold">{c.contract_value}M</span>
                <span className={`text-xs text-center font-semibold ${c.satisfaction >= 4.5 ? "text-green" : c.satisfaction >= 4.0 ? "text-amber" : "text-danger"}`}>
                  {c.satisfaction > 0 ? c.satisfaction : "—"}
                </span>
              </div>
            ))}
          </div>
        </CardPanel>

        {/* By type */}
        <CardPanel title="Phân loại khách hàng">
          <div className="mt-3 space-y-3">
            {(data?.byType || []).map((t) => (
              <div key={t.type} className="flex items-center gap-3">
                <span className="text-xs text-t2 w-[140px]">{t.type}</span>
                <div className="flex-1 h-6 bg-bg2 rounded overflow-hidden">
                  <div className="h-full bg-info/40 rounded flex items-center justify-center"
                    style={{ width: `${t.pct}%` }}>
                    <span className="text-[10px] text-t1 font-semibold">{t.count} KH ({t.pct}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardPanel>

        {/* Revenue by customer */}
        <CardPanel title="Doanh thu theo khách hàng (triệu VNĐ)">
          <div className="mt-2 space-y-2">
            {[...clients].filter((c) => c.contract_value > 0).sort((a, b) => b.contract_value - a.contract_value).map((c) => {
              const maxRev = Math.max(...clients.map((x) => x.contract_value || 0), 1);
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xs text-t2 w-[130px] truncate">{c.name}</span>
                  <div className="flex-1 h-5 bg-bg2 rounded overflow-hidden">
                    <div className="h-full bg-teal/40 rounded flex items-center justify-end px-1.5"
                      style={{ width: `${(c.contract_value / maxRev) * 100}%` }}>
                      <span className="text-[10px] text-t1 font-semibold">{c.contract_value}M</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardPanel>

        {/* Contract alerts */}
        <CardPanel title="Cảnh báo hợp đồng">
          <div className="mt-2 space-y-2">
            {clients.filter((c) => c.contract_status === "expiring" || c.contract_status === "expired").map((c) => (
              <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded bg-bg2 border-l-2 border-amber">
                <div>
                  <div className="text-xs text-t1 font-medium">{c.name}</div>
                  <div className="text-[10px] text-t3">DT: {c.contract_value}M/tháng</div>
                </div>
                <Chip color={c.contract_status === "expiring" ? "amber" : "danger"}>
                  {c.contract_status === "expiring" ? "Sắp hết hạn" : "Đã hết hạn"}
                </Chip>
              </div>
            ))}
            {clients.filter((c) => c.contract_status === "expiring" || c.contract_status === "expired").length === 0 && (
              <div className="text-xs text-t3 text-center py-4">Không có cảnh báo</div>
            )}
          </div>
        </CardPanel>
      </div>
    </div>
  );
}
