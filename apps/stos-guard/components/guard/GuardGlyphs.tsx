import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

const S = 24;

export type GuardGlyphName =
  | "shield-gold"
  | "bell"
  | "chevron-back"
  | "chevron-right"
  | "checkin"
  | "checkout"
  | "patrol"
  | "incident"
  | "queue"
  | "pin"
  | "clock"
  | "qr"
  | "info"
  | "check-square"
  | "circle-empty"
  | "incident-security"
  | "incident-fire"
  | "incident-wrench"
  | "incident-box"
  | "incident-car"
  | "incident-more"
  | "camera";

export function GuardGlyph({ name, size = 24, color = "#fff" }: { name: GuardGlyphName; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${S} ${S}`}>
      {render(name, color)}
    </Svg>
  );
}

function render(name: GuardGlyphName, c: string) {
  switch (name) {
    case "shield-gold":
      return (
        <>
          <Path d="M12 2.5 L20 6.5 V12 c0 5.5-4 9.5-8 10.5-4-1-8-5-8-10.5 V6.5 Z" fill={c} />
          <Path d="M9 12 l2.5 2.5 5-5.5" stroke="#0B0E14" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    case "bell":
      return (
        <>
          <Path d="M12 4a4.5 4.5 0 0 1 4.5 4.5v4l2 2.2H5.5l2-2.2V8.5A4.5 4.5 0 0 1 12 4z" fill={c} />
          <Path d="M10 18.5a2 2 0 0 0 4 0" fill={c} />
        </>
      );
    case "chevron-back":
      return <Path d="M15 6 l-6 6 6 6" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
    case "chevron-right":
      return <Path d="M9 6 l6 6-6 6" stroke={c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
    case "checkin":
      return (
        <>
          <Rect x={7} y={4} width={10} height={16} rx={1.5} fill={c} />
          <Path d="M12 9 v6 M9.5 12.5 L12 15 l2.5-2.5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    case "checkout":
      return (
        <>
          <Rect x={7} y={4} width={10} height={16} rx={1.5} fill={c} />
          <Path d="M12 15 V9 M9.5 11.5 L12 9 l2.5 2.5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    case "patrol":
      return (
        <>
          <Path d="M12 3 L20 7 V12 c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9 V7 Z" fill={c} />
          <Path d="M9 12 l2 2 4-4.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    case "incident":
      return (
        <>
          <Path d="M12 4.5 20 19 H4 Z" fill={c} />
          <Line x1={12} y1={9} x2={12} y2={14} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
          <Circle cx={12} cy={17} r={1} fill="#fff" />
        </>
      );
    case "queue":
      return (
        <>
          <Circle cx={9} cy={9} r={2.5} fill={c} />
          <Circle cx={16} cy={10} r={2} fill={c} opacity={0.85} />
          <Path d="M4 19 v-1 a3.5 3.5 0 0 1 3.5-3.5" fill={c} />
          <Path d="M13 19 v-1 a3 3 0 0 1 3-2.5" fill={c} opacity={0.85} />
        </>
      );
    case "pin":
      return (
        <>
          <Path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" fill={c} />
          <Circle cx={12} cy={11} r={2.5} fill="#fff" />
        </>
      );
    case "clock":
      return (
        <>
          <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" />
          <Path d="M12 7 v5 l3.5 2" stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" />
        </>
      );
    case "qr":
      return (
        <>
          <Rect x={4} y={4} width={7} height={7} rx={1} fill={c} />
          <Rect x={13} y={4} width={7} height={7} rx={1} fill={c} />
          <Rect x={4} y={13} width={7} height={7} rx={1} fill={c} />
          <Rect x={14} y={14} width={6} height={6} fill={c} />
        </>
      );
    case "info":
      return (
        <>
          <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" />
          <Line x1={12} y1={11} x2={12} y2={16} stroke={c} strokeWidth={2} strokeLinecap="round" />
          <Circle cx={12} cy={8} r={1.2} fill={c} />
        </>
      );
    case "check-square":
      return (
        <>
          <Rect x={4} y={4} width={16} height={16} rx={3} fill={c} />
          <Path d="M8 12 l3 3 6-7" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    case "circle-empty":
      return <Circle cx={12} cy={12} r={9} stroke={c} strokeWidth={2} fill="none" />;
    case "incident-security":
      return (
        <>
          <Path d="M12 4.5 20 19 H4 Z" fill={c} />
          <Line x1={12} y1={9} x2={12} y2={14} stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        </>
      );
    case "incident-fire":
      return <Path d="M12 4c2 3 4 4 4 7a4 4 0 0 1-8 0c0-2 1.5-3.5 2-6 1 1.5 2 2.5 2 4.5" fill={c} />;
    case "incident-wrench":
      return (
        <Path
          d="M14.5 6.5a4.5 4.5 0 0 0-6 6L4 17l3 3 4.5-4.5a4.5 4.5 0 0 0 6-6l-2-2 1.5-1.5 2 2z"
          fill={c}
        />
      );
    case "incident-box":
      return (
        <>
          <Path d="M4 8 l8-4 8 4v10 H4 Z" fill={c} />
          <Path d="M12 4 v10" stroke="#fff" strokeWidth={1.5} opacity={0.5} />
        </>
      );
    case "incident-car":
      return (
        <>
          <Path d="M4 14h16l-1.6-5.5a2 2 0 0 0-1.9-1.5H7.5A2 2 0 0 0 5.6 8.5L4 14z" fill={c} />
          <Circle cx={8} cy={15} r={1.8} fill="#fff" />
          <Circle cx={16} cy={15} r={1.8} fill="#fff" />
        </>
      );
    case "incident-more":
      return (
        <>
          <Circle cx={7} cy={12} r={1.5} fill={c} />
          <Circle cx={12} cy={12} r={1.5} fill={c} />
          <Circle cx={17} cy={12} r={1.5} fill={c} />
        </>
      );
    case "camera":
      return (
        <>
          <Rect x={3} y={7} width={18} height={13} rx={2} fill={c} />
          <Circle cx={12} cy={13.5} r={3.5} fill="#fff" opacity={0.9} />
        </>
      );
    default:
      return null;
  }
}
