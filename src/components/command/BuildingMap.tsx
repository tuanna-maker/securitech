import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useBuildings, type BuildingRow } from "@/features/buildings";

interface Props {
  onSelectBuilding: (b: BuildingRow) => void;
  selectedId?: string;
}

const statusColors: Record<string, string> = {
  normal: "#2dd4bf",
  warning: "#f59e0b",
  critical: "#ef4444",
};

function createIcon(status: string, isSelected: boolean) {
  const color = statusColors[status] || statusColors.normal;
  const size = isSelected ? 36 : 28;
  const iconSize = Math.round(size * 0.55);
  const buildingSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`;

  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:${color};box-shadow:0 2px 8px ${color}66${isSelected ? `,0 0 16px ${color}88` : ''};border:2px solid ${isSelected ? '#fff' : color};transform:scale(${isSelected ? 1.15 : 1});transition:transform .2s,box-shadow .2s;${status === 'critical' ? 'animation:lf-pulse 1.5s infinite;' : ''}">${buildingSvg}</div>`,
  });
}

function buildPopupHtml(b: BuildingRow) {
  const staffColor = b.staff_online / b.staff_total < 0.7 ? "color:#ef4444;font-weight:600" : "";
  const incColor = b.critical_incidents > 0 ? "color:#ef4444;font-weight:600" : "";
  const slaColor = b.sla_percent < 90 ? "color:#ef4444" : b.sla_percent < 95 ? "color:#f59e0b" : "color:#2dd4bf";

  return `<div style="min-width:180px;padding:2px;">
    <div style="font-size:11px;font-weight:600;margin-bottom:6px;">${b.name}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;font-size:10px;">
      <span style="opacity:.6">Khu vực:</span><span>${b.region || ""}</span>
      <span style="opacity:.6">Nhân viên:</span><span style="${staffColor}">${b.staff_online}/${b.staff_total}</span>
      <span style="opacity:.6">Sự cố:</span><span style="${incColor}">${b.incidents_today}${b.critical_incidents > 0 ? ` (${b.critical_incidents} critical)` : ""}</span>
      <span style="opacity:.6">SLA:</span><span style="${slaColor};font-weight:500">${b.sla_percent}%</span>
      <span style="opacity:.6">Tuần tra:</span><span>${b.patrol_completion}%</span>
    </div>
  </div>`;
}

export default function BuildingMap({ onSelectBuilding, selectedId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const buildingsDataRef = useRef<BuildingRow[]>([]);

  const { data } = useBuildings({ limit: 200 });
  const buildings = data?.data ?? [];
  buildingsDataRef.current = buildings;

  const handleClick = useCallback((b: BuildingRow) => {
    onSelectBuilding(b);
  }, [onSelectBuilding]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    map.setView([10.76, 106.66], 12);
    mapRef.current = map;

    const style = document.createElement("style");
    style.textContent = `@keyframes lf-pulse{0%,100%{opacity:.6}50%{opacity:1}}`;
    document.head.appendChild(style);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      style.remove();
    };
  }, []);

  // Update markers when buildings change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || buildings.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    const bounds = L.latLngBounds([]);
    buildings.forEach((b) => {
      if (!b.lat || !b.lng) return;
      const marker = L.marker([b.lat, b.lng], {
        icon: createIcon(b.status, b.id === selectedId),
      }).addTo(map);

      marker.bindPopup(buildPopupHtml(b), {
        closeButton: false,
        className: "building-popup",
        maxWidth: 220,
      });

      marker.on("click", () => handleClick(b));
      markersRef.current.set(b.id, marker);
      bounds.extend([b.lat, b.lng]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.15));
    }
  }, [buildings, handleClick, selectedId]);

  // Update selected marker icon
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const b = buildingsDataRef.current.find((bl) => bl.id === id);
      if (!b) return;
      const isSelected = id === selectedId;
      marker.setIcon(createIcon(b.status, isSelected));
      if (isSelected) marker.openPopup();
    });
  }, [selectedId]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-border h-[300px] sm:h-[380px] lg:h-[460px]">
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border">
        {([
          { key: "normal", label: "Bình thường" },
          { key: "warning", label: "Cảnh báo" },
          { key: "critical", label: "Nghiêm trọng" },
        ] as const).map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: statusColors[s.key] }} />
            <span className="text-[9px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="absolute top-3 left-3 z-[1000] text-[10px] text-muted-foreground font-mono uppercase tracking-wider bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border">
        Bản đồ giám sát — {buildings.length} Tòa nhà
      </div>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
