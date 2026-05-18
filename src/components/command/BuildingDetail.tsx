import { useState } from "react";
import { type BuildingRow } from "@/features/buildings";
import { Chip } from "@/components/ui/StatusChip";
import { db } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";

interface Props {
  building: BuildingRow;
  onClose: () => void;
}

const statusColor = { normal: "bg-emerald-400", warning: "bg-amber", critical: "bg-danger" };
const statusLabel = { normal: "Bình thường", warning: "Cảnh báo", critical: "Nghiêm trọng" };
const incSevColor = { critical: "danger" as const, high: "amber" as const, medium: "info" as const, low: "gray" as const };
const incStatusColor = { new: "danger" as const, processing: "amber" as const, resolved: "teal" as const };
const incStatusLabel = { new: "Mới", processing: "Đang xử lý", resolved: "Đã xử lý" };

const tabs = [
  { id: "overview", label: "Tổng quan" },
  { id: "staff", label: "Nhân sự" },
  { id: "incidents", label: "Sự cố" },
  { id: "patrol", label: "Tuần tra" },
  { id: "timeline", label: "Dòng thời gian" },
];

function useBuildingStaff(buildingId: string) {
  return useQuery({
    queryKey: ["staff_members", buildingId],
    queryFn: async () => {
      const { data, error } = await db
        .from("staff_members")
        .select("*")
        .eq("building_id", buildingId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

function useBuildingIncidents(buildingId: string) {
  return useQuery({
    queryKey: ["incidents", buildingId],
    queryFn: async () => {
      const { data, error } = await db
        .from("incidents")
        .select("*")
        .eq("building_id", buildingId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export default function BuildingDetail({ building, onClose }: Props) {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: staff = [] } = useBuildingStaff(building.id);
  const { data: incidents = [] } = useBuildingIncidents(building.id);

  const onPatrol = staff.filter((s) => s.status === "on-patrol").length;
  const stationary = staff.filter((s) => s.status === "stationary").length;
  const offline = staff.filter((s) => s.status === "offline").length;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-bg1 border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 shrink-0">
        <div className={`w-3 h-3 rounded-full ${statusColor[building.status]} ${building.status === "critical" ? "animate-pulse" : ""}`} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-display font-bold truncate">{building.name}</div>
          <div className="text-[10px] text-t3">{building.region || ""} · {building.management_company || ""}</div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center bg-bg3 text-t2 hover:text-t1 cursor-pointer text-sm">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-[1px] bg-bg2 mx-3 mt-2 rounded-md p-[2px] shrink-0">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1 rounded-[5px] text-[10px] cursor-pointer transition-all
              ${activeTab === t.id ? "bg-bg4 text-t1 font-medium" : "text-t3 hover:text-t1"}`}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "overview" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Trạng thái", value: statusLabel[building.status], color: building.status === "critical" ? "text-danger" : building.status === "warning" ? "text-amber" : "text-emerald-400" },
                { label: "SLA", value: `${building.sla_percent}%`, color: building.sla_percent >= 95 ? "text-emerald-400" : building.sla_percent >= 90 ? "text-amber" : "text-danger" },
                { label: "Nhân viên", value: `${building.staff_online}/${building.staff_total}`, color: building.staff_online / building.staff_total >= 0.8 ? "text-emerald-400" : "text-danger" },
                { label: "Sự cố hôm nay", value: `${building.incidents_today}`, color: building.critical_incidents > 0 ? "text-danger" : "text-t1" },
                { label: "Tuần tra", value: `${building.patrol_completion}%`, color: building.patrol_completion > 85 ? "text-emerald-400" : "text-amber" },
                { label: "Nghiêm trọng", value: `${building.critical_incidents}`, color: building.critical_incidents > 0 ? "text-danger" : "text-emerald-400" },
              ].map((s, i) => (
                <div key={i} className="bg-bg2 rounded-lg p-2.5">
                  <div className="text-[9px] text-t4 uppercase tracking-wider mb-1">{s.label}</div>
                  <div className={`font-mono text-lg font-bold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-bg2 rounded-lg p-2.5">
              <div className="text-[9px] text-t4 uppercase tracking-wider mb-1">Địa chỉ</div>
              <div className="text-[11.5px]">{building.address || "—"}, {building.region || ""}</div>
            </div>

            <div className="bg-bg2 rounded-lg p-2.5">
              <div className="text-[9px] text-t4 uppercase tracking-wider mb-2">Phân bổ nhân sự</div>
              {[
                { label: "Đang trực", count: onPatrol, color: "text-emerald-400", dot: "bg-emerald-400" },
                { label: "Chờ sẵn", count: stationary, color: "text-amber", dot: "bg-amber" },
                { label: "Ngoại tuyến", count: offline, color: "text-t3", dot: "bg-bg4" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                  <span className="text-[10.5px] text-t2 flex-1">{s.label}</span>
                  <span className={`font-mono text-[11px] font-semibold ${s.color}`}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "staff" && (
          <div className="space-y-1.5">
            {staff.length === 0 ? (
              <div className="text-center text-[11px] text-t3 py-8">Chưa có nhân viên</div>
            ) : staff.map((s) => (
              <div key={s.id} className="flex items-center gap-2.5 bg-bg2 rounded-lg p-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[8px] font-bold shrink-0
                  ${s.status === "on-patrol" ? "bg-emerald-500/15 text-emerald-400" : s.status === "stationary" ? "bg-amber/15 text-amber" : "bg-bg4 text-t3"}`}>
                  {s.name.split(" ").slice(-2).map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium truncate">{s.name}</div>
                  <div className="text-[9.5px] text-t3">{s.role} · {s.zone || "—"}</div>
                </div>
                <div className="text-right shrink-0">
                  <Chip color={s.status === "on-patrol" ? "teal" : s.status === "stationary" ? "amber" : "gray"}>
                    {s.status === "on-patrol" ? "Tuần tra" : s.status === "stationary" ? "Tại vị trí" : "Ngoại tuyến"}
                  </Chip>
                  {!s.in_assigned_zone && s.status !== "offline" && (
                    <div className="text-[8px] text-danger mt-0.5">⚠ Ngoài vùng</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "incidents" && (
          <div className="space-y-1.5">
            {incidents.length === 0 ? (
              <div className="text-center text-[11px] text-t3 py-8">Không có sự cố ✓</div>
            ) : incidents.map((inc) => (
              <div key={inc.id} className="bg-bg2 rounded-lg p-2.5 border-l-2"
                style={{ borderLeftColor: inc.severity === "critical" ? "hsl(var(--danger))" : inc.severity === "high" ? "hsl(var(--amber))" : "hsl(var(--info))" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[9px] text-t3">{inc.id.slice(0, 8)}</span>
                  <div className="flex gap-1">
                    <Chip color={incSevColor[inc.severity as keyof typeof incSevColor] || "gray"}>{inc.severity}</Chip>
                    <Chip color={incStatusColor[inc.status as keyof typeof incStatusColor] || "gray"}>
                      {incStatusLabel[inc.status as keyof typeof incStatusLabel] || inc.status}
                    </Chip>
                  </div>
                </div>
                <div className="text-[11.5px] font-medium mb-0.5">{inc.description || inc.type}</div>
                <div className="text-[10px] text-t3">{inc.type} · {new Date(inc.created_at).toLocaleString("vi-VN")}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "patrol" && (
          <div className="space-y-3">
            <div className="bg-bg2 rounded-lg p-3 relative overflow-hidden" style={{ height: 160 }}>
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "linear-gradient(hsl(var(--t3)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--t3)) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="relative z-10">
                <div className="text-[9px] text-t4 uppercase tracking-wider mb-2">Lộ trình tuần tra — Trực tiếp</div>
                <svg viewBox="0 0 340 100" className="w-full h-20">
                  <path d="M20 80 L80 30 L150 50 L220 20 L280 60 L320 35" fill="none" stroke="hsl(var(--teal))" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
                  {[{ x: 20, y: 80, done: true }, { x: 80, y: 30, done: true }, { x: 150, y: 50, done: true },
                    { x: 220, y: 20, done: true }, { x: 280, y: 60, done: false }, { x: 320, y: 35, done: false }].map((cp, i) => (
                    <circle key={i} cx={cp.x} cy={cp.y} r="5" fill={cp.done ? "hsl(var(--teal))" : "hsl(var(--bg4))"} stroke="hsl(var(--bg1))" strokeWidth="2" />
                  ))}
                  <circle cx="220" cy="20" r="8" fill="hsl(var(--teal))" opacity="0.3">
                    <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </div>

            <div>
              <div className="text-[9px] text-t4 uppercase tracking-wider font-bold mb-1.5">Điểm kiểm tra</div>
              {["Cổng chính", "Tầng hầm B1", "Tầng hầm B2", "Sảnh chính", "Khu bãi xe", "Tầng thượng"].map((cp, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border last:border-b-0">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${i < 4 ? "bg-emerald-500/15 text-emerald-400" : "bg-bg3 text-t3"}`}>
                    {i < 4 ? "✓" : "○"}
                  </div>
                  <span className="text-[10.5px] flex-1">{cp}</span>
                  <span className="font-mono text-[9.5px] text-t3">{i < 4 ? `${14 + i}:${10 + i * 8}` : "—"}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-t3">Hoàn thành</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 bg-bg3 rounded-full overflow-hidden w-20">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${building.patrol_completion}%` }} />
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-emerald-400">{building.patrol_completion}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="relative pl-[18px]">
            <div className="absolute left-[5px] top-[6px] bottom-[6px] w-px bg-border" />
            {[
              { time: "14:45", text: `Sự cố xâm nhập đã báo cáo — ${building.name}`, color: "bg-danger" },
              { time: "14:30", text: "Tuần tra checkpoint 4/6 hoàn thành", color: "bg-emerald-400" },
              { time: "14:00", text: "Ca trực chuyển giao thành công", color: "bg-emerald-400" },
              { time: "12:30", text: "Kiểm tra PCCC định kỳ hoàn tất", color: "bg-info" },
              { time: "11:00", text: "Cư dân khiếu nại tiếng ồn — đã xử lý", color: "bg-amber" },
              { time: "08:00", text: "Ca sáng bắt đầu — tất cả check-in đúng giờ", color: "bg-emerald-400" },
            ].map((e, i) => (
              <div key={i} className="relative mb-3 last:mb-0">
                <div className={`absolute -left-[15px] top-[3px] w-2 h-2 rounded-full border-2 border-bg1 ${e.color}`} />
                <div className="flex gap-2">
                  <span className="font-mono text-[10px] text-t3 shrink-0 w-10">{e.time}</span>
                  <span className="text-[11px] leading-relaxed">{e.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-3 py-2 border-t border-border flex gap-2 shrink-0">
        <button className="flex-1 py-1.5 rounded-md bg-teal text-bg0 text-[11px] font-semibold cursor-pointer hover:brightness-90">📋 Xuất báo cáo</button>
        <button className="flex-1 py-1.5 rounded-md border border-border-strong text-t2 text-[11px] cursor-pointer hover:border-teal hover:text-teal">⚙ Cài đặt tòa nhà</button>
      </div>
    </div>
  );
}
