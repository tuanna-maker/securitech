import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { ArrowRight } from "lucide-react";

interface Props {
  onSelectBuilding: (buildingId: string) => void;
}

const typeBadge: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: "bg-danger", text: "text-white", label: "NGHIÊM TRỌNG" },
  warning: { bg: "bg-amber", text: "text-black", label: "CẢNH BÁO" },
  info: { bg: "bg-info", text: "text-white", label: "THÔNG TIN" },
  success: { bg: "bg-teal", text: "text-white", label: "BÌNH THƯỜNG" },
};

function useAlerts() {
  return useQuery({
    queryKey: ["alerts-stream"],
    queryFn: async () => {
      const { data, error } = await db
        .from("alerts")
        .select("*, buildings!alerts_building_id_fkey(name)")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []).map((a: any) => ({
        id: a.id,
        timestamp: new Date(a.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        buildingName: a.buildings?.name ?? "—",
        buildingId: a.building_id,
        type: a.type as "critical" | "warning" | "info" | "success",
        description: a.description,
      }));
    },
    refetchInterval: 15_000,
  });
}

export default function AlertStream({ onSelectBuilding }: Props) {
  const { data: alerts = [] } = useAlerts();

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
        <div className="text-sm font-semibold flex items-center gap-2">
          <span className="text-danger">⊘</span>
          Cảnh báo sự cố
          <span className="bg-danger text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {alerts.length}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 overflow-y-auto max-h-[220px]">
        {alerts.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">Không có cảnh báo</div>
        ) : alerts.map((a) => {
          const badge = typeBadge[a.type] || typeBadge.info;
          return (
            <div
              key={a.id}
              onClick={() => a.buildingId && onSelectBuilding(a.buildingId)}
              className="px-4 py-2.5 border-b border-border/50 cursor-pointer transition-colors hover:bg-muted/50 flex items-center gap-3"
            >
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${badge.bg} ${badge.text} shrink-0 uppercase tracking-wide`}>
                {badge.label}
              </span>
              <span className="text-sm text-foreground truncate flex-1">{a.description} – {a.buildingName}</span>
              <span className="text-xs text-muted-foreground font-mono shrink-0">{a.timestamp}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
