import { useState, useEffect } from "react";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator } from "@/components/ui/command";
import { useBuildings, type BuildingRow } from "@/features/buildings";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/db";

const sevColor: Record<string, string> = {
  critical: "text-danger",
  high: "text-danger",
  medium: "text-amber",
  low: "text-t3",
};

interface Props {
  onNavigate?: (screen: string) => void;
  onSelectBuilding?: (id: string) => void;
}

function useSearchStaff() {
  return useQuery({
    queryKey: ["search-staff"],
    queryFn: async () => {
      const { data } = await db.from("staff_members").select("id, name, role, buildings!staff_members_building_id_fkey(name)").limit(10);
      return (data ?? []).map((s: any) => ({ name: s.name, role: s.role, building: s.buildings?.name ?? "—" }));
    },
    staleTime: 60_000,
  });
}

function useSearchIncidents() {
  return useQuery({
    queryKey: ["search-incidents"],
    queryFn: async () => {
      const { data } = await db
        .from("incidents")
        .select("id, type, description, severity, buildings!incidents_building_id_fkey(name)")
        .order("created_at", { ascending: false })
        .limit(8);
      return (data ?? []).map((i: any) => ({ title: i.description || i.type, building: i.buildings?.name ?? "—", severity: i.severity }));
    },
    staleTime: 60_000,
  });
}

export default function GlobalSearch({ onNavigate, onSelectBuilding }: Props) {
  const [open, setOpen] = useState(false);
  const { data: buildingsData } = useBuildings({ limit: 15 });
  const { data: staffData = [] } = useSearchStaff();
  const { data: incidentsData = [] } = useSearchIncidents();

  const buildings = buildingsData?.data ?? [];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Tìm tòa nhà, nhân viên, sự cố… (Ctrl+K)" />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>

        <CommandGroup heading="Tòa nhà">
          {buildings.map((b: BuildingRow) => (
            <CommandItem key={b.id} onSelect={() => { onSelectBuilding?.(b.id); setOpen(false); }}
              className="flex items-center gap-2 cursor-pointer">
              <div className={`w-2 h-2 rounded-full shrink-0 ${b.status === "critical" ? "bg-danger" : b.status === "warning" ? "bg-amber" : "bg-emerald-400"}`} />
              <span>{b.name}</span>
              <span className="ml-auto text-[10px] text-t3 font-mono">{b.staff_online}/{b.staff_total} staff · SLA {b.sla_percent}%</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Nhân viên">
          {staffData.map((e, i) => (
            <CommandItem key={i} onSelect={() => { onNavigate?.("hr"); setOpen(false); }}
              className="flex items-center gap-2 cursor-pointer">
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-t3 shrink-0">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
                <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              <span>{e.name}</span>
              <span className="text-[10px] text-t3">{e.role}</span>
              <span className="ml-auto text-[10px] text-t3">{e.building}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Sự cố">
          {incidentsData.map((inc, i) => (
            <CommandItem key={i} onSelect={() => { onNavigate?.("incidents"); setOpen(false); }}
              className="flex items-center gap-2 cursor-pointer">
              <div className={`w-2 h-2 rounded-full shrink-0 ${inc.severity === "critical" || inc.severity === "high" ? "bg-danger" : inc.severity === "medium" ? "bg-amber" : "bg-emerald-400"}`} />
              <span className={sevColor[inc.severity] || "text-t2"}>{inc.title}</span>
              <span className="ml-auto text-[10px] text-t3">{inc.building}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Điều hướng nhanh">
          {[
            { label: "Dashboard", screen: "dashboard", icon: "📊" },
            { label: "Quản lý Nhân sự", screen: "hr", icon: "👥" },
            { label: "Quản lý Sự cố", screen: "incidents", icon: "🚨" },
            { label: "Tài chính & Lương", screen: "finance", icon: "💰" },
            { label: "Đào tạo nội bộ", screen: "training", icon: "📚" },
            { label: "Truyền thông", screen: "comms", icon: "📢" },
          ].map((item) => (
            <CommandItem key={item.screen} onSelect={() => { onNavigate?.(item.screen); setOpen(false); }}
              className="cursor-pointer">
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
