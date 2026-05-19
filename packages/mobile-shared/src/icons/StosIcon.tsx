import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import type { StosIconName } from "./types";

type Props = {
  name: StosIconName;
  size?: number;
  color?: string;
  /** soft = đậm hơn, giống glyph mockup; filled = nét dày + tô nhẹ */
  variant?: "line" | "soft" | "filled";
};

const S = 24;

export function StosIcon({ name, size = 24, color = "#1E3066", variant = "soft" }: Props) {
  const sw = variant === "line" ? 1.5 : variant === "filled" ? 2 : 1.85;
  const p = { stroke: color, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" as const };
  const f = (fill = color, opacity = variant === "filled" ? 0.22 : 0) => ({ fill, fillOpacity: opacity });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${S} ${S}`}>
      {render(name, p, f, color, variant)}
    </Svg>
  );
}

type StrokeProps = {
  stroke: string;
  strokeWidth: number;
  strokeLinecap: "round";
  strokeLinejoin: "round";
  fill: "none";
};

function render(
  name: StosIconName,
  p: StrokeProps,
  f: (c?: string, o?: number) => { fill: string; fillOpacity?: number },
  c: string,
  variant: "line" | "soft" | "filled"
) {
  switch (name) {
    case "tab-community":
      return (
        <>
          <Circle cx={8} cy={9} r={2.2} {...p} />
          <Circle cx={16} cy={9} r={2.2} {...p} />
          <Circle cx={12} cy={7} r={2} {...p} />
          <Path d="M4 18 v-1 a3.5 3.5 0 0 1 3.5-3.5 H8" {...p} />
          <Path d="M20 18 v-1 a3.5 3.5 0 0 0-3.5-3.5 H16" {...p} />
          <Path d="M9 18 v-1 a3 3 0 0 1 3-3 h0 a3 3 0 0 1 3 3 v1" {...p} />
        </>
      );
    case "tab-home":
      return (
        <>
          <Path d="M4 10.5 L12 4 L20 10.5 V19 a1 1 0 0 1-1 1H5 a1 1 0 0 1-1-1 Z" {...p} />
          <Path d="M9 20 V13 h6 v7" {...p} />
        </>
      );
    case "tab-family":
      return (
        <>
          <Circle cx={9} cy={9} r={2.5} {...p} />
          <Circle cx={16} cy={10} r={2} {...p} />
          <Path d="M4 19 v-1 a4 4 0 0 1 4-4 h2 a4 4 0 0 1 4 4 v1" {...p} />
          <Path d="M14 19 v-1 a3 3 0 0 1 3-2.5" {...p} />
        </>
      );
    case "tab-shield":
    case "shield-badge":
    case "shield-grab":
    case "patrol":
      return <Path d="M12 3 L20 7 V12 c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9 V7 Z M9.5 12 l2 2 4-4.5" {...p} />;
    case "tab-health":
    case "health-heart":
      return (
        <>
          <Path d="M6 12 h2 l1.5-3 2 6 1.5-3 H18" {...p} />
          <Path d="M4 18 h16" {...p} />
        </>
      );
    case "tab-account":
    case "person":
      return (
        <>
          <Circle cx={12} cy={8} r={3.5} {...p} />
          <Path d="M5 20 v-1 a5 5 0 0 1 5-5 h4 a5 5 0 0 1 5 5 v1" {...p} />
        </>
      );
    case "tab-calendar":
    case "calendar":
      return (
        <>
          <Rect x={4} y={5} width={16} height={15} rx={2} {...p} />
          <Line x1={4} y1={9} x2={20} y2={9} stroke={c} strokeWidth={1.75} />
          <Line x1={8} y1={3} x2={8} y2={7} {...p} />
          <Line x1={16} y1={3} x2={16} y2={7} {...p} />
        </>
      );
    case "tab-bell":
    case "notifications":
      return (
        <>
          <Path d="M12 4a4 4 0 0 1 4 4v4 l2 2.5 H6 L8 12 V8 a4 4 0 0 1 4-4Z" {...p} />
          <Path d="M10 18.5 a2 2 0 0 0 4 0" {...p} />
        </>
      );
    case "chevron-right":
      return <Path d="M9 6 l6 6-6 6" {...p} />;
    case "chevron-down":
      return <Path d="M6 9 l6 6 6-6" {...p} />;
    case "chevron-back":
      return <Path d="M15 6 l-6 6 6 6" {...p} />;
    case "call":
      return (
        <Path
          d="M8.5 5.5 c0 0 1-1 3.5 0 5.5s5 5.5 5.5 5.5 2 0 2.5 1.5 5.5 0 5.5-3.5 1-5.5 0-8-3-11.5-5.5S5.5 5.5 5.5 5.5"
          {...p}
        />
      );
    case "chat":
    case "feedback":
      return <Path d="M5 6 h14 a2 2 0 0 1 2 2 v6 a2 2 0 0 1-2 2H10 l-4 3.5 V8 a2 2 0 0 1 2-2Z" {...p} />;
    case "sos":
    case "warning-triangle":
    case "incident":
      return (
        <>
          <Path d="M12 4.5 20.5 19 H3.5 Z" {...p} />
          <Line x1={12} y1={9} x2={12} y2={14} stroke={c} strokeWidth={2} strokeLinecap="round" />
          <Circle cx={12} cy={17} r={0.75} fill={c} />
        </>
      );
    case "fire":
      return (
        <Path
          d="M12 4c2 3 4 4 4 7a4 4 0 0 1-8 0c0-2 1.5-3.5 2-6 1 1.5 2 2.5 2 4.5"
          {...p}
        />
      );
    case "stranger":
      return (
        <>
          <Circle cx={12} cy={8} r={3} {...p} />
          <Path d="M6 19 v-1 a4 4 0 0 1 4-3.5" {...p} />
          <Path d="M16 12 l3 3 M19 12 l-3 3" stroke={c} strokeWidth={1.75} strokeLinecap="round" />
        </>
      );
    case "car":
    case "family-car":
    case "traffic":
      return (
        <>
          <Path d="M5 14 h14 l-1.5-5.5a2 2 0 0 0-2-1.5H8.5 a2 2 0 0 0-2 1.5 Z" {...p} />
          <Circle cx={8} cy={15.5} r={1.5} {...p} />
          <Circle cx={16} cy={15.5} r={1.5} {...p} />
        </>
      );
    case "parcel":
    case "property-box":
      return (
        <>
          <Path d="M4 8 l8-4 8 4v9 H4 Z" {...p} />
          <Path d="M12 4 v9" {...p} />
        </>
      );
    case "more-dots":
      return (
        <>
          <Circle cx={6} cy={12} r={1.25} fill={c} />
          <Circle cx={12} cy={12} r={1.25} fill={c} />
          <Circle cx={18} cy={12} r={1.25} fill={c} />
        </>
      );
    case "wallet":
      return (
        <>
          <Rect x={3} y={6} width={18} height={13} rx={2.5} {...p} />
          <Path d="M3 10 h18" {...p} />
          <Circle cx={16} cy={14} r={1.5} {...p} />
        </>
      );
    case "child":
      return (
        <>
          <Circle cx={12} cy={7} r={2.5} {...p} />
          <Path d="M8 18 v-1 a3 3 0 0 1 3-2.5h2 a3 3 0 0 1 3 2.5 v1" {...p} />
          <Path d="M6 11 h2 M16 11 h2" {...p} />
        </>
      );
    case "fridge":
      return (
        <>
          <Rect x={6} y={3} width={12} height={18} rx={2} {...p} />
          <Line x1={6} y1={9} x2={18} y2={9} stroke={c} strokeWidth={1.75} />
          <Line x1={10} y1={6} x2={10.01} y2={6} stroke={c} strokeWidth={2} strokeLinecap="round" />
        </>
      );
    case "travel":
      return <Path d="M4 14 L12 5 l3 4 5-2-3 9H7 l3-4-3 2Z" {...p} />;
    case "home-service":
      return (
        <>
          <Path d="M4 11 L12 5 l8 6 V19 H4 Z" {...p} />
          <Rect x={10} y={13} width={4} height={6} rx={0.5} {...p} />
        </>
      );
    case "shopping":
      return (
        <>
          <Path d="M7 8 H5 L6 20 h12 l1-12 H9" {...p} />
          <Circle cx={9} cy={8} r={1.5} {...p} />
          <Circle cx={17} cy={8} r={1.5} {...p} />
        </>
      );
    case "crown":
      return (
        <Path d="M5 16 h14 l-1.5-8-2.5 3-2-4-2 4-2.5-3 Z M8 18 v2 h8 v-2" {...p} />
      );
    case "members":
    case "people":
    case "queue-people":
      return (
        <>
          <Circle cx={9} cy={9} r={2.5} {...p} />
          <Circle cx={16} cy={10} r={2} {...p} />
          <Path d="M4 18 v-1 a3.5 3.5 0 0 1 3.5-3.5" {...p} />
          <Path d="M13 18 v-1 a3 3 0 0 1 3-2.5" {...p} />
        </>
      );
    case "memories":
      return <Path d="M12 4 l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.4 5Z" {...p} />;
    case "settings":
      return (
        <>
          <Circle cx={12} cy={12} r={2.5} {...p} />
          <Path
            d="M12 3 v2 M12 19v2 M3 12h2 M19 12h2 M5.6 5.6l1.4 1.4 M17 17l1.4 1.4 M5.6 18.4l1.4-1.4 M17 7l1.4-1.4"
            {...p}
          />
        </>
      );
    case "camera":
    case "receipt-scan":
      return (
        <>
          <Rect x={3} y={6} width={18} height={13} rx={2} {...p} />
          <Circle cx={12} cy={12.5} r={3.5} {...p} />
        </>
      );
    case "videocam":
      return (
        <>
          <Rect x={2} y={7} width={14} height={10} rx={2} {...p} />
          <Path d="M16 10 l6-3 v10 l-6-3" {...p} />
        </>
      );
    case "history":
    case "clock":
    case "time":
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...p} />
          <Path d="M12 8 v4.5 l3 2" {...p} />
        </>
      );
    case "id-card":
      return (
        <>
          <Rect x={3} y={5} width={18} height={14} rx={2} {...p} />
          <Circle cx={9} cy={11} r={2} {...p} />
          <Line x1={13} y1={9} x2={18} y2={9} stroke={c} strokeWidth={1.75} strokeLinecap="round" />
          <Line x1={13} y1={13} x2={17} y2={13} stroke={c} strokeWidth={1.75} strokeLinecap="round" />
        </>
      );
    case "map-pin":
      return (
        <>
          <Path d="M12 21s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z" {...p} />
          <Circle cx={12} cy={11} r={2} {...p} />
        </>
      );
    case "sparkles":
      return (
        <>
          <Path d="M12 3 l1 4 4 1-4 1-1 4-1-4-4-1 4-1Z" {...p} />
          <Path d="M5 5 l.8 1.2 1.2.8-1.2.8L5 9l-.8-1.2-1.2-.8 1.2-.8Z" {...p} />
        </>
      );
    case "hardware-chip":
      return (
        <>
          <Rect x={6} y={6} width={12} height={12} rx={2} {...p} />
          <Line x1={12} y1={3} x2={12} y2={6} {...p} />
          <Line x1={12} y1={18} x2={12} y2={21} {...p} />
          <Line x1={3} y1={12} x2={6} y2={12} {...p} />
          <Line x1={18} y1={12} x2={21} y2={12} {...p} />
        </>
      );
    case "restaurant":
      return (
        <>
          <Path d="M8 4 v8 M6 4 v3 a2 2 0 0 0 4 0" {...p} />
          <Path d="M16 4 v16 M14 4 v2 a2 2 0 0 0 4 0" {...p} />
        </>
      );
    case "home-building":
      return (
        <>
          <Rect x={4} y={10} width={6} height={10} {...p} />
          <Rect x={14} y={6} width={6} height={14} {...p} />
          <Rect x={10} y={14} width={4} height={6} {...p} />
        </>
      );
    case "paw":
      return (
        <>
          <Circle cx={8} cy={9} r={1.5} {...p} />
          <Circle cx={12} cy={7} r={1.5} {...p} />
          <Circle cx={16} cy={9} r={1.5} {...p} />
          <Path d="M7 12 c0 3 2.5 6 5 6s5-3 5-6" {...p} />
        </>
      );
    case "medkit":
    case "medical-bag":
      return (
        <>
          <Rect x={5} y={7} width={14} height={12} rx={2} {...p} />
          <Path d="M12 10 v6 M9 13 h6" {...p} />
        </>
      );
    case "gamepad":
      return (
        <>
          <Rect x={4} y={8} width={16} height={9} rx={4} {...p} />
          <Path d="M9 11.5 v3 M7.5 13 h3" {...p} />
          <Circle cx={15.5} cy={12} r={0.75} fill={c} />
          <Circle cx={17} cy={13.5} r={0.75} fill={c} />
        </>
      );
    case "leaf":
    case "leaf-store":
      return <Path d="M12 20c-5-4-6-10-2-14 6 2 10 6 12 14 2Z M12 20 V10" {...p} />;
    case "coffee":
      return (
        <>
          <Path d="M7 8 h10 v6 a4 4 0 0 1-4 4H9 a2 2 0 0 1-2-2 Z" {...p} />
          <Path d="M17 9 h1.5 a2.5 2.5 0 0 1 0 5H17" {...p} />
          <Line x1={6} y1={20} x2={16} y2={20} stroke={c} strokeWidth={1.75} strokeLinecap="round" />
        </>
      );
    case "lightning":
      return <Path d="M13 3 L5 14 h6 l-1 7 9-12 h-6Z" fill={c} stroke="none" />;
    case "eye":
      return (
        <>
          <Path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" {...p} />
          <Circle cx={12} cy={12} r={2.5} {...p} />
        </>
      );
    case "search":
      return (
        <>
          <Circle cx={11} cy={11} r={6} {...p} />
          <Path d="M16 16 l5 5" {...p} />
        </>
      );
    case "share":
      return (
        <>
          <Circle cx={18} cy={6} r={2} {...p} />
          <Circle cx={6} cy={12} r={2} {...p} />
          <Circle cx={18} cy={18} r={2} {...p} />
          <Path d="M8 11 l8-3 M8 13 l8 3" {...p} />
        </>
      );
    case "chart":
      return (
        <>
          <Line x1={4} y1={19} x2={20} y2={19} {...p} />
          <Rect x={6} y={12} width={3} height={7} rx={0.5} {...p} />
          <Rect x={11} y={8} width={3} height={11} rx={0.5} {...p} />
          <Rect x={16} y={5} width={3} height={14} rx={0.5} {...p} />
        </>
      );
    case "checkin":
    case "enter":
      return (
        <>
          <Path d="M12 4 v12 M8 12 l4 4 4-4" {...p} />
          <Path d="M5 20 h14" {...p} />
        </>
      );
    case "checkout":
    case "exit":
      return (
        <>
          <Path d="M12 20 V8 M8 12 l4-4 4 4" {...p} />
          <Path d="M5 4 h14" {...p} />
        </>
      );
    case "qr":
    case "qr-guest":
      return (
        <>
          <Rect x={4} y={4} width={6} height={6} {...p} />
          <Rect x={14} y={4} width={6} height={6} {...p} />
          <Rect x={4} y={14} width={6} height={6} {...p} />
          <Path d="M14 14 h2 v2 h2 v2 h2 M18 18 h2 v2" {...p} />
        </>
      );
    case "location":
    case "navigate":
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...p} />
          <Path d="M12 8 v4 l2.5 2.5" {...p} />
        </>
      );
    case "info":
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...p} />
          <Line x1={12} y1={11} x2={12} y2={16} stroke={c} strokeWidth={2} strokeLinecap="round" />
          <Circle cx={12} cy={8} r={0.75} fill={c} />
        </>
      );
    case "check-on":
    case "check-circle":
      return (
        <>
          <Circle cx={12} cy={12} r={9} {...p} />
          <Path d="M8 12 l3 3 5-6" {...p} />
        </>
      );
    case "check-off":
    case "circle-outline":
      return <Circle cx={12} cy={12} r={9} {...p} />;
    case "footsteps":
      return <Path d="M8 18 c2-4 1-7 3-10 2 1 4 0 5 2 1 3-1 5 2" {...p} />;
    case "moon":
      return <Path d="M20 13.5 A7.5 7.5 0 0 1 10.5 4 9 9 0 1 0 20 13.5Z" {...p} />;
    case "energy":
      return <Path d="M12 3c3 4 1 6 4 9-3 1-4 4-4 7-5-2-7-5-9-4-3-5Z" fill={c} stroke="none" />;
    case "heart":
      return (
        <Path
          d="M12 20s-6-4-6-9a3.5 3.5 0 0 1 6-2 3.5 3.5 0 0 1 6 2c0 5-6 9-6 9Z"
          {...p}
        />
      );
    case "construct":
      return (
        <>
          <Path d="M14 4 l2 2-8 8-3 1 1-3 8-8 2 2" {...p} />
          <Path d="M16 6 l2 2" {...p} />
        </>
      );
    case "flask":
      return <Path d="M10 3 h4 v6 l5 9a3 3 0 0 1-3 3h-8 a3 3 0 0 1-3-3 l5-9 Z" {...p} />;
    case "document":
      return (
        <>
          <Path d="M8 4 h8 l4 4 v12 H8 Z" {...p} />
          <Path d="M16 4 v4 h4" {...p} />
          <Line x1={10} y1={12} x2={16} y2={12} stroke={c} strokeWidth={1.75} strokeLinecap="round" />
        </>
      );
    case "vaccine":
      return (
        <>
          <Path d="M12 3 v4 M10 7 h4" {...p} />
          <Rect x={9} y={7} width={6} height={12} rx={1} {...p} />
        </>
      );
    case "allergy":
      return (
        <>
          <Circle cx={12} cy={12} r={8} {...p} />
          <Line x1={8} y1={8} x2={16} y2={16} stroke={c} strokeWidth={1.75} />
          <Line x1={16} y1={8} x2={8} y2={16} stroke={c} strokeWidth={1.75} />
        </>
      );
    case "stethoscope":
      return (
        <>
          <Path d="M6 4 v6 a4 4 0 0 0 8 0 V4" {...p} />
          <Path d="M14 14 v2 a3 3 0 0 0 6 0 v-1" {...p} />
          <Circle cx={20} cy={14} r={1.5} {...p} />
        </>
      );
    case "pills":
      return (
        <>
          <Rect x={5} y={8} width={8} height={8} rx={4} transform="rotate(-45 9 12)" {...p} />
          <Line x1={14} y1={14} x2={19} y2={19} stroke={c} strokeWidth={1.75} strokeLinecap="round" />
        </>
      );
    case "folder":
      return <Path d="M4 8 h6 l2 2 h10 v10 H4 Z" {...p} />;
    case "insurance":
      return <Path d="M12 3 L20 7 v6 c0 4.5-3 7.5-8 8-5-.5-8-3.5-8-8 V7 Z" {...p} />;
    case "add-person":
      return (
        <>
          <Circle cx={10} cy={9} r={3} {...p} />
          <Path d="M5 19 v-1 a4 4 0 0 1 4-3.5" {...p} />
          <Path d="M17 8 v6 M14 11 h6" {...p} />
        </>
      );
    case "card":
      return (
        <>
          <Rect x={3} y={6} width={18} height={12} rx={2} {...p} />
          <Line x1={3} y1={10} x2={21} y2={10} stroke={c} strokeWidth={1.75} />
        </>
      );
    default:
      return <Circle cx={12} cy={12} r={8} {...p} />;
  }
}
