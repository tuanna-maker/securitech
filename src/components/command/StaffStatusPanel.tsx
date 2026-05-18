import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { useBuildingStats } from "@/features/buildings";
import { ArrowRight, Clock } from "lucide-react";

function useRecentActivity() {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const { data, error } = await db
        .from("incidents")
        .select("id, type, status, created_at, buildings!incidents_building_id_fkey(name)")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []).map((i: any) => ({
        id: i.id,
        time: new Date(i.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        action: i.status === "resolved" ? "Đã xử lý" : i.status === "in-progress" ? "Đang xử lý" : "Đã báo cáo",
        type: i.type,
        building: i.buildings?.name ?? "—",
      }));
    },
    refetchInterval: 30_000,
  });
}

const statusDot: Record<string, string> = {
  "Đã xử lý": "bg-teal",
  "Đang xử lý": "bg-amber",
  "Đã báo cáo": "bg-danger",
};

export default function StaffStatusPanel() {
  const stats = useBuildingStats();
  const { data: activities = [] } = useRecentActivity();

  const highRisk = [...stats.buildings]
    .filter((b) => b.status === "critical" || b.status === "warning")
    .sort((a, b) => a.sla_percent - b.sla_percent)
    .slice(0, 5);

  const riskReasons: Record<string, string> = {};
  highRisk.forEach((b) => {
    if (b.critical_incidents > 0) riskReasons[b.id] = "Sự cố nghiêm trọng";
    else if (b.sla_percent < 90) riskReasons[b.id] = "SLA thấp";
    else if (b.staff_online / b.staff_total < 0.7) riskReasons[b.id] = "Thiếu nhân sự";
    else riskReasons[b.id] = "Cảnh báo";
  });

  return (
    <div className="flex flex-col gap-3">
      {/* High Risk Buildings */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="text-sm font-semibold flex items-center gap-2">
            <span className="text-amber">⚠</span>
            Cơ sở rủi ro cao
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="divide-y divide-border/50">
          {highRisk.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">Không có cơ sở rủi ro cao</div>
          ) : highRisk.map((b) => (
            <div key={b.id} className="px-4 py-2 flex items-center justify-between hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-base">🏢</span>
                <span className="text-sm text-foreground font-medium">{b.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{riskReasons[b.id]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Hoạt động gần đây
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="divide-y divide-border/50 max-h-[200px] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">Chưa có hoạt động</div>
          ) : activities.map((a) => (
            <div key={a.id} className="px-4 py-2 flex items-center gap-3 hover:bg-muted/30 transition-colors">
              <span className="text-xs text-muted-foreground font-mono shrink-0">{a.time}</span>
              <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot[a.action] || "bg-info"}`} />
              <span className="text-sm text-foreground truncate flex-1">{a.type} {a.action}</span>
              <span className="text-xs text-muted-foreground font-medium shrink-0 truncate max-w-[120px]">{a.building}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
