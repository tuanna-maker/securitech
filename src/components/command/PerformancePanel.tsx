import { XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from "recharts";
import { useBuildingStats } from "@/features/buildings";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";

function useIncidentTrend() {
  return useQuery({
    queryKey: ["incident-trend-14d"],
    queryFn: async () => {
      const days: { day: string; incidents: number; resolved: number }[] = [];
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        const start = new Date(d); start.setHours(0, 0, 0, 0);
        const end = new Date(d); end.setHours(23, 59, 59, 999);

        const { count: total } = await db
          .from("incidents")
          .select("*", { count: "exact", head: true })
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString());

        const { count: resolved } = await db
          .from("incidents")
          .select("*", { count: "exact", head: true })
          .gte("created_at", start.toISOString())
          .lte("created_at", end.toISOString())
          .eq("status", "resolved");

        days.push({ day: label, incidents: total ?? 0, resolved: resolved ?? 0 });
      }
      return days;
    },
    staleTime: 60_000,
  });
}

export default function PerformancePanel() {
  const stats = useBuildingStats();
  const { data: trendData } = useIncidentTrend();

  // SLA compliance per building
  const slaData = [...stats.buildings]
    .sort((a, b) => b.sla_percent - a.sla_percent)
    .slice(0, 6)
    .map((b) => ({ name: b.name, sla: b.sla_percent }));

  // Incident summary
  const totalIncidents = stats.totalIncidents;
  const criticalCount = stats.totalCriticalIncidents;
  const warningCount = stats.buildings.reduce((sum, b) => sum + (b.status === "warning" ? b.incidents_today : 0), 0);
  const normalCount = totalIncidents - criticalCount - warningCount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* SLA Compliance */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="text-sm font-semibold">Tuân thủ SLA</div>
          <span className="text-lg font-bold text-primary">{stats.avgSla}%</span>
        </div>
        <div className="p-4 space-y-2.5">
          {slaData.map((b, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground truncate mr-2">{b.name}</span>
                <span className="text-xs font-semibold text-muted-foreground">{b.sla}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    b.sla >= 95 ? "bg-teal" : b.sla >= 90 ? "bg-amber" : "bg-danger"
                  }`}
                  style={{ width: `${b.sla}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incident Chart */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="text-sm font-semibold">Phân bố sự cố</div>
        </div>
        <div className="p-4">
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData || []}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="incidents" radius={[3, 3, 0, 0]} name="Sự cố">
                  {(trendData || []).map((_, index) => (
                    <Cell key={index} fill="hsl(var(--primary))" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 mt-3">
            {[
              { label: "Tổng sự cố", value: totalIncidents, bg: "bg-info/10 text-info" },
              { label: "Nghiêm trọng", value: criticalCount, bg: "bg-danger/10 text-danger" },
              { label: "Đã xử lý", value: normalCount, bg: "bg-teal/10 text-teal" },
            ].map((s, i) => (
              <div key={i} className={`flex-1 rounded-lg px-3 py-2 text-center ${s.bg}`}>
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-[10px]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Status */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="text-sm font-semibold">Tình hình xử lý sự cố</div>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Đang xử lý", value: criticalCount, icon: "⊘", color: "text-danger" },
              { label: "Leo thang", value: warningCount, icon: "△", color: "text-amber" },
              { label: "Chờ xử lý", value: totalIncidents - criticalCount - warningCount, icon: "◷", color: "text-muted-foreground" },
              { label: "Đã giải quyết", value: stats.buildings.reduce((s, b) => s + (b.status === "normal" ? b.incidents_today : 0), 0), icon: "✓", color: "text-teal" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <span className={`text-xl font-bold ${item.color}`}>{item.value}</span>
                <div>
                  <div className={`text-lg ${item.color}`}>{item.icon}</div>
                  <div className="text-[10px] text-muted-foreground">{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Worst performing */}
          <div className="space-y-1.5">
            {stats.buildings
              .filter((b) => b.status === "critical" || b.status === "warning")
              .sort((a, b) => a.sla_percent - b.sla_percent)
              .slice(0, 3)
              .map((b) => (
                <div key={b.id} className="flex items-center justify-between py-1 text-xs border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      b.status === "critical" ? "bg-danger text-white" : "bg-amber text-black"
                    }`}>
                      {b.status === "critical" ? "NGHIÊM TRỌNG" : "CẢNH BÁO"}
                    </span>
                    <span className="text-foreground">{b.name}</span>
                  </div>
                  <span className="text-muted-foreground font-mono">{b.sla_percent}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
