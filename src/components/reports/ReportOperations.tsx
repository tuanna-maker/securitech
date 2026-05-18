import CardPanel from "@/components/ui/CardPanel";
import { Chip } from "@/components/ui/StatusChip";
import { useBuildingStats } from "@/features/buildings";

export default function ReportOperations() {
  const stats = useBuildingStats();
  const buildings = stats.buildings;

  const avgPatrol = buildings.length > 0 ? Math.round(buildings.reduce((s, b) => s + b.patrol_completion, 0) / buildings.length) : 0;

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {[
          { label: "Tổng tòa nhà", value: String(stats.total), color: "text-teal" },
          { label: "SLA Trung bình", value: `${stats.avgSla}%`, color: stats.avgSla >= 95 ? "text-green" : "text-amber" },
          { label: "Tuần tra TB", value: `${avgPatrol}%`, color: avgPatrol >= 90 ? "text-green" : "text-amber" },
          { label: "Nhân viên online", value: `${stats.totalStaffOnline}/${stats.totalStaff}`, color: "text-info" },
          { label: "Tổng sự cố", value: String(stats.totalIncidents), color: stats.totalIncidents > 20 ? "text-amber" : "text-teal" },
          { label: "Sự cố nghiêm trọng", value: String(stats.totalCriticalIncidents), color: stats.totalCriticalIncidents > 0 ? "text-danger" : "text-green" },
        ].map((k) => (
          <div key={k.label} className="bg-bg1 border border-border rounded-xl px-4 py-3">
            <div className="text-xs text-t2 uppercase tracking-wider font-semibold mb-1">{k.label}</div>
            <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <CardPanel title="SLA & Tuần tra theo tòa nhà">
          <div className="mt-2 space-y-1">
            <div className="grid grid-cols-[1fr_70px_70px_70px] gap-2 text-[10px] text-t3 font-medium px-2 pb-1 border-b border-border">
              <span>Tòa nhà</span><span className="text-center">SLA</span><span className="text-center">Tuần tra</span><span className="text-center">Sự cố</span>
            </div>
            {buildings.slice(0, 10).map((b) => (
              <div key={b.id} className="grid grid-cols-[1fr_70px_70px_70px] gap-2 items-center px-2 py-1.5 rounded hover:bg-bg2 transition-colors">
                <span className="text-xs text-t1 truncate">{b.name}</span>
                <span className={`text-xs font-semibold text-center ${b.sla_percent >= 97 ? "text-green" : b.sla_percent >= 95 ? "text-amber" : "text-danger"}`}>{b.sla_percent}%</span>
                <span className={`text-xs text-center ${b.patrol_completion >= 95 ? "text-green" : b.patrol_completion >= 90 ? "text-amber" : "text-danger"}`}>{b.patrol_completion}%</span>
                <div className="flex justify-center">
                  <Chip color={b.incidents_today <= 2 ? "green" : b.incidents_today <= 5 ? "amber" : "danger"}>{b.incidents_today}</Chip>
                </div>
              </div>
            ))}
          </div>
        </CardPanel>

        <CardPanel title="Phân bổ trạng thái tòa nhà">
          <div className="mt-3 space-y-2.5">
            {[
              { label: "Bình thường", count: stats.normal, color: "bg-green/40", textColor: "text-green" },
              { label: "Cảnh báo", count: stats.warning, color: "bg-amber/40", textColor: "text-amber" },
              { label: "Nghiêm trọng", count: stats.critical, color: "bg-danger/40", textColor: "text-danger" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-xs text-t2 w-[100px]">{s.label}</span>
                <div className="flex-1 h-5 bg-bg2 rounded overflow-hidden">
                  <div className={`h-full rounded flex items-center px-1.5 ${s.color}`}
                    style={{ width: `${stats.total > 0 ? (s.count / stats.total) * 100 : 0}%` }}>
                    <span className={`text-[10px] font-semibold ${s.textColor}`}>{s.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardPanel>
      </div>
    </div>
  );
}
