import { useBuildingStats } from "@/features/buildings";
import { Shield, Users, AlertTriangle, Building2 } from "lucide-react";

const kpiIcons = [Building2, Users, AlertTriangle, Shield];

export default function CommandKpiBar() {
  const stats = useBuildingStats();

  const kpis = [
    {
      label: "TỔNG SỐ TÒA NHÀ",
      value: stats.total,
      sub: `▲ ${stats.normal} hoạt động tốt`,
      subColor: "text-teal",
      icon: 0,
    },
    {
      label: "NHÂN VIÊN TRỰC TUYẾN",
      value: `${stats.totalStaffOnline}/${stats.totalStaff}`,
      sub: stats.totalStaff > 0
        ? `${Math.round((stats.totalStaffOnline / stats.totalStaff) * 100)}% Online`
        : "0%",
      subColor: stats.totalStaff > 0 && stats.totalStaffOnline / stats.totalStaff > 0.85 ? "text-teal" : "text-amber",
      icon: 1,
    },
    {
      label: "SỰ CỐ ĐANG XỬ LÝ",
      value: stats.totalIncidents,
      sub: `(${stats.totalCriticalIncidents} Critical)`,
      subColor: stats.totalCriticalIncidents > 0 ? "text-danger" : "text-muted-foreground",
      icon: 2,
    },
    {
      label: "CƠ SỞ RỦI RO CAO",
      value: stats.critical + stats.warning,
      sub: stats.avgSla >= 95 ? "▲ Ổn định" : `▼ SLA ${stats.avgSla}%`,
      subColor: stats.avgSla >= 95 ? "text-teal" : "text-danger",
      icon: 3,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {kpis.map((kpi, i) => {
        const Icon = kpiIcons[i];
        return (
          <div
            key={i}
            className="bg-card border border-border rounded-lg px-4 py-3 flex items-start justify-between animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">
                {kpi.label}
              </div>
              <div className="text-2xl font-bold text-foreground leading-none mb-1">
                {stats.isLoading ? "—" : kpi.value}
              </div>
              <div className={`text-[11px] font-medium ${kpi.subColor}`}>
                {kpi.sub}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
