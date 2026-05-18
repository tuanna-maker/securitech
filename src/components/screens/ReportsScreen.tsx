import { useState } from "react";
import { Loader2 } from "lucide-react";
import { exportReportExcel } from "@/lib/exportExcel";
import KpiCard from "@/components/ui/KpiCard";
import CardPanel from "@/components/ui/CardPanel";
import { useReportOverview } from "@/features/reports";
import ReportOperations from "@/components/reports/ReportOperations";
import ReportFinance from "@/components/reports/ReportFinance";
import ReportStaff from "@/components/reports/ReportStaff";
import ReportIncidents from "@/components/reports/ReportIncidents";
import ReportCustomers from "@/components/reports/ReportCustomers";

const tabs = [
  { id: "overview", label: "Tổng quan" },
  { id: "operations", label: "Vận hành" },
  { id: "finance", label: "Tài chính" },
  { id: "staff", label: "Nhân sự" },
  { id: "incidents", label: "Sự cố" },
  { id: "customers", label: "Khách hàng" },
];

const periods = [
  { id: "month", label: "Tháng này" },
  { id: "quarter", label: "Quý này" },
  { id: "year", label: "Năm 2025" },
];

export default function ReportsScreen() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activePeriod, setActivePeriod] = useState("month");

  const { data: overview, isLoading } = useReportOverview();

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-3.5">
        <KpiCard label="Tổng doanh thu" value={overview?.totalRevenue || "0"} valueSuffix="tỷ" deltaType="up" color="teal" />
        <KpiCard label="SLA trung bình" value={`${overview?.avgSla || 0}%`} deltaType="up" color="green" />
        <KpiCard label="Tổng sự cố" value={overview?.totalIncidents || 0} color="amber" />
        <KpiCard label="Nhân sự" value={overview?.totalStaff || 0} color="info" />
        <KpiCard label="Khách hàng" value={overview?.totalClients || 0} color="purple" />
        <KpiCard label="Ca trực HT" value={`${overview?.shiftRate || 0}%`} color="green" />
      </div>

      {/* Tabs + Period */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3.5">
        <div className="flex gap-[1px] bg-bg2 rounded-lg p-[3px] overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === t.id ? "bg-teal-muted text-teal" : "text-t2 hover:text-t1"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-bg2 rounded-lg p-[3px]">
          {periods.map((p) => (
            <button key={p.id} onClick={() => setActivePeriod(p.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activePeriod === p.id ? "bg-teal-muted text-teal" : "text-t2 hover:text-t1"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-teal" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {/* Incident by Type */}
            <CardPanel title="⚠️ Phân loại sự cố">
              <div className="space-y-2.5 mt-2">
                {(overview?.incidentsByType || []).length === 0 && (
                  <div className="text-xs text-t3 text-center py-4">Chưa có dữ liệu sự cố</div>
                )}
                {(overview?.incidentsByType || []).map((item) => (
                  <div key={item.type} className="flex items-center gap-3">
                    <span className="text-xs text-t2 w-[130px] truncate">{item.type}</span>
                    <div className="flex-1 h-5 bg-bg2 rounded overflow-hidden">
                      <div className="h-full bg-amber/60 rounded flex items-center px-1.5"
                        style={{ width: `${Math.min(item.pct * 4, 100)}%` }}>
                        <span className="text-[10px] text-t1 font-semibold">{item.count}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-t3 w-8 text-right">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </CardPanel>

            {/* Building overview */}
            <CardPanel title="🏢 Tổng quan tòa nhà">
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                {(overview?.buildings || []).length === 0 && (
                  <div className="col-span-3 text-xs text-t3 text-center py-4">Chưa có tòa nhà</div>
                )}
                {(overview?.buildings || []).map((b) => (
                  <div key={b.id} className="bg-bg2 rounded-lg p-3 text-center">
                    <div className="text-xs text-t1 font-medium truncate mb-2">{b.name}</div>
                    <div className={`text-lg font-bold ${Number(b.sla_percent) >= 97 ? "text-green" : Number(b.sla_percent) >= 95 ? "text-amber" : "text-danger"}`}>
                      {b.sla_percent}%
                    </div>
                    <div className="text-[10px] text-t3 mt-1">SLA</div>
                    <div className="flex justify-center gap-3 mt-2 text-[10px]">
                      <span className="text-t2">👥 {b.staff_total}</span>
                      <span className={b.incidents_today > 3 ? "text-danger" : "text-t2"}>⚠ {b.incidents_today}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardPanel>
          </div>
        )
      )}

      {activeTab === "operations" && <ReportOperations />}
      {activeTab === "finance" && <ReportFinance />}
      {activeTab === "staff" && <ReportStaff />}
      {activeTab === "incidents" && <ReportIncidents />}
      {activeTab === "customers" && <ReportCustomers />}

      {/* Export bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-bg1 border border-border rounded-xl">
        <span className="text-xs text-t2">Xuất báo cáo:</span>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => exportReportExcel(activeTab)}
            className="px-3 py-1.5 bg-bg2 hover:bg-teal-muted text-xs text-t1 rounded-lg border border-border hover:border-border-accent transition-colors">
            📊 Excel (tab hiện tại)
          </button>
          <button onClick={() => exportReportExcel()}
            className="px-3 py-1.5 bg-teal-muted hover:bg-teal/30 text-xs text-teal font-medium rounded-lg border border-border-accent transition-colors">
            📋 Excel (toàn bộ)
          </button>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="px-4 py-1.5 bg-teal text-bg0 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
            🖨️ In báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}
