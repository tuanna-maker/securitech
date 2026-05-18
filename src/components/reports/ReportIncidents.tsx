import CardPanel from "@/components/ui/CardPanel";
import { Chip } from "@/components/ui/StatusChip";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";

function useIncidentReportData() {
  return useQuery({
    queryKey: ["report-incidents"],
    queryFn: async () => {
      const { data: incidents } = await db.from("incidents").select("severity, status, type, response_time_minutes, building_id, buildings!incidents_building_id_fkey(name, region, sla_percent)");
      const all = incidents ?? [];
      const total = all.length;
      const resolved = all.filter((i) => i.status === "resolved").length;
      const avgTime = all.filter((i) => i.response_time_minutes).reduce((s, i) => s + (i.response_time_minutes ?? 0), 0) / (all.filter((i) => i.response_time_minutes).length || 1);
      const critical = all.filter((i) => i.severity === "critical").length;

      const bySeverity = [
        { level: "Nghiêm trọng", count: all.filter((i) => i.severity === "critical").length, color: "danger" as const },
        { level: "Cao", count: all.filter((i) => i.severity === "high").length, color: "amber" as const },
        { level: "Trung bình", count: all.filter((i) => i.severity === "medium").length, color: "info" as const },
        { level: "Thấp", count: all.filter((i) => i.severity === "low").length, color: "green" as const },
      ];

      const typeMap = new Map<string, { count: number; resolved: number; totalTime: number; timeCount: number }>();
      all.forEach((i) => {
        const t = typeMap.get(i.type) ?? { count: 0, resolved: 0, totalTime: 0, timeCount: 0 };
        t.count++;
        if (i.status === "resolved") t.resolved++;
        if (i.response_time_minutes) { t.totalTime += i.response_time_minutes; t.timeCount++; }
        typeMap.set(i.type, t);
      });
      const byType = Array.from(typeMap.entries()).map(([type, v]) => ({
        type, count: v.count, resolved: v.resolved, avgTime: v.timeCount > 0 ? Math.round(v.totalTime / v.timeCount) : 0,
        pct: total > 0 ? Math.round((v.count / total) * 100) : 0,
      })).sort((a, b) => b.count - a.count);

      const buildingMap = new Map<string, { name: string; region: string; incidents: number; sla: number }>();
      all.forEach((i: any) => {
        if (!i.buildings) return;
        const b = buildingMap.get(i.building_id) ?? { name: i.buildings.name, region: i.buildings.region || "", incidents: 0, sla: Number(i.buildings.sla_percent) };
        b.incidents++;
        buildingMap.set(i.building_id, b);
      });
      const byBuilding = Array.from(buildingMap.values()).sort((a, b) => b.incidents - a.incidents);

      return { total, resolved, avgTime: Math.round(avgTime), critical, bySeverity, byType, byBuilding };
    },
  });
}

export default function ReportIncidents() {
  const { data } = useIncidentReportData();
  if (!data) return <div className="text-center text-t3 py-8">Đang tải...</div>;

  const maxSev = Math.max(...data.bySeverity.map((s) => s.count), 1);

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { label: "Tổng sự cố", value: String(data.total), color: "text-amber" },
          { label: "Đã xử lý", value: String(data.resolved), delta: `Tỷ lệ ${data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0}%`, color: "text-green" },
          { label: "Thời gian phản hồi TB", value: `${data.avgTime} phút`, color: "text-teal" },
          { label: "Nghiêm trọng", value: String(data.critical), color: "text-danger" },
        ].map((k) => (
          <div key={k.label} className="bg-bg1 border border-border rounded-xl px-4 py-3">
            <div className="text-xs text-t2 uppercase tracking-wider font-semibold mb-1">{k.label}</div>
            <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
            {k.delta && <div className="text-[10px] text-teal">{k.delta}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <CardPanel title="Phân loại theo mức độ">
          <div className="mt-3 space-y-3">
            {data.bySeverity.map((s) => (
              <div key={s.level} className="flex items-center gap-3">
                <Chip color={s.color}>{s.level}</Chip>
                <div className="flex-1 h-5 bg-bg2 rounded overflow-hidden">
                  <div className={`h-full rounded flex items-center px-1.5 ${s.color === "danger" ? "bg-danger/40" : s.color === "amber" ? "bg-amber/40" : s.color === "info" ? "bg-info/40" : "bg-green/40"}`}
                    style={{ width: `${(s.count / maxSev) * 100}%` }}>
                    <span className="text-[10px] text-t1 font-semibold">{s.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardPanel>

        <CardPanel title="Phân loại theo danh mục">
          <div className="space-y-2.5 mt-3">
            {data.byType.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <span className="text-xs text-t2 w-[130px] truncate">{item.type}</span>
                <div className="flex-1 h-5 bg-bg2 rounded overflow-hidden">
                  <div className="h-full bg-amber/50 rounded flex items-center px-1.5" style={{ width: `${Math.max(item.pct * 4, 10)}%` }}>
                    <span className="text-[10px] text-t1 font-semibold">{item.count}</span>
                  </div>
                </div>
                <span className="text-[10px] text-t3 w-8 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </CardPanel>

        <CardPanel title="Tỷ lệ xử lý theo danh mục">
          <div className="mt-2 space-y-1">
            <div className="grid grid-cols-[1fr_50px_50px_70px] gap-2 text-[10px] text-t3 font-medium px-2 pb-1 border-b border-border">
              <span>Loại sự cố</span><span className="text-center">Tổng</span><span className="text-center">Xong</span><span className="text-center">TB (phút)</span>
            </div>
            {data.byType.map((item) => (
              <div key={item.type} className="grid grid-cols-[1fr_50px_50px_70px] gap-2 items-center px-2 py-1.5 rounded hover:bg-bg2 transition-colors">
                <span className="text-xs text-t1 truncate">{item.type}</span>
                <span className="text-xs text-t2 text-center">{item.count}</span>
                <span className="text-xs text-green text-center font-semibold">{item.resolved}</span>
                <span className={`text-xs text-center font-semibold ${item.avgTime <= 15 ? "text-green" : item.avgTime <= 25 ? "text-amber" : "text-danger"}`}>{item.avgTime}</span>
              </div>
            ))}
          </div>
        </CardPanel>

        <CardPanel title="Sự cố theo tòa nhà">
          <div className="mt-2 space-y-1">
            <div className="grid grid-cols-[1fr_80px_60px_80px] gap-2 text-[10px] text-t3 font-medium px-2 pb-1 border-b border-border">
              <span>Tòa nhà</span><span>Khu vực</span><span className="text-center">Số SC</span><span className="text-center">SLA</span>
            </div>
            {data.byBuilding.slice(0, 10).map((b) => (
              <div key={b.name} className="grid grid-cols-[1fr_80px_60px_80px] gap-2 items-center px-2 py-1.5 rounded hover:bg-bg2 transition-colors">
                <span className="text-xs text-t1 truncate">{b.name}</span>
                <span className="text-[10px] text-t3">{b.region}</span>
                <span className="text-xs text-t1 text-center font-semibold">{b.incidents}</span>
                <span className={`text-xs text-center font-semibold ${b.sla >= 97 ? "text-green" : b.sla >= 95 ? "text-amber" : "text-danger"}`}>{b.sla}%</span>
              </div>
            ))}
          </div>
        </CardPanel>
      </div>
    </div>
  );
}
