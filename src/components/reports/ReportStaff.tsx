import CardPanel from "@/components/ui/CardPanel";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";

function useStaffReport() {
  return useQuery({
    queryKey: ["report-staff"],
    queryFn: async () => {
      const { data: staff } = await db.from("staff_members").select("id, name, role, status, building_id, buildings!staff_members_building_id_fkey(name)");
      const all = staff ?? [];
      const total = all.length;
      const online = all.filter((s) => s.status !== "offline").length;

      const byRole = new Map<string, number>();
      all.forEach((s) => { byRole.set(s.role, (byRole.get(s.role) ?? 0) + 1); });
      const byPosition = Array.from(byRole.entries()).map(([position, count]) => ({
        position, count, pct: total > 0 ? Math.round((count / total) * 100) : 0,
      })).sort((a, b) => b.count - a.count);

      const byBuilding = new Map<string, { name: string; count: number }>();
      all.forEach((s: any) => {
        const bName = s.buildings?.name ?? "Chưa phân";
        const bId = s.building_id ?? "none";
        const b = byBuilding.get(bId) ?? { name: bName, count: 0 };
        b.count++;
        byBuilding.set(bId, b);
      });
      const buildingList = Array.from(byBuilding.values()).sort((a, b) => b.count - a.count);

      return { total, online, onlineRate: total > 0 ? Math.round((online / total) * 100) : 0, byPosition, byBuilding: buildingList };
    },
  });
}

export default function ReportStaff() {
  const { data } = useStaffReport();
  if (!data) return <div className="text-center text-t3 py-8">Đang tải...</div>;

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { label: "Tổng nhân sự", value: String(data.total), color: "text-info" },
          { label: "Đang online", value: String(data.online), color: "text-teal" },
          { label: "Tỷ lệ online", value: `${data.onlineRate}%`, color: data.onlineRate >= 85 ? "text-green" : "text-amber" },
          { label: "Số vị trí", value: String(data.byPosition.length), color: "text-purple" },
        ].map((k) => (
          <div key={k.label} className="bg-bg1 border border-border rounded-xl px-4 py-3">
            <div className="text-xs text-t2 uppercase tracking-wider font-semibold mb-1">{k.label}</div>
            <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <CardPanel title="Phân bổ theo chức vụ">
          <div className="mt-3 space-y-2.5">
            {data.byPosition.map((p) => (
              <div key={p.position} className="flex items-center gap-3">
                <span className="text-xs text-t2 w-[130px] truncate">{p.position}</span>
                <div className="flex-1 h-5 bg-bg2 rounded overflow-hidden">
                  <div className="h-full bg-info/40 rounded flex items-center px-1.5" style={{ width: `${Math.max(p.pct * 2, 8)}%` }}>
                    <span className="text-[10px] text-t1 font-semibold">{p.count}</span>
                  </div>
                </div>
                <span className="text-[10px] text-t3 w-8 text-right">{p.pct}%</span>
              </div>
            ))}
          </div>
        </CardPanel>

        <CardPanel title="Nhân sự theo tòa nhà">
          <div className="mt-2 space-y-2">
            {data.byBuilding.slice(0, 10).map((b) => (
              <div key={b.name} className="flex items-center gap-3">
                <span className="text-xs text-t2 w-[130px] truncate">{b.name}</span>
                <div className="flex-1 h-5 bg-bg2 rounded overflow-hidden">
                  <div className="h-full bg-purple/40 rounded flex items-center justify-end px-1.5"
                    style={{ width: `${Math.max((b.count / (data.byBuilding[0]?.count || 1)) * 100, 8)}%` }}>
                    <span className="text-[10px] text-t1 font-semibold">{b.count}</span>
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
