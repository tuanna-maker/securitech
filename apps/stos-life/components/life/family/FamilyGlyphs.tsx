import Svg, { Circle, Path, Rect } from "react-native-svg";

type G = { size?: number; color: string };

const S = 24;

/** Icon filled kiểu mockup Life — Gia đình tôi */
export function FamilyGlyph({ name, size = 24, color }: G & { name: FamilyGlyphName }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${S} ${S}`}>
      <GInner name={name} color={color} />
    </Svg>
  );
}

export type FamilyGlyphName =
  | "members"
  | "calendar"
  | "memories"
  | "settings"
  | "wallet"
  | "child"
  | "food"
  | "health"
  | "pills"
  | "stethoscope"
  | "plane"
  | "home"
  | "car"
  | "cart"
  | "crown"
  | "chevron"
  | "bell"
  | "camera"
  | "robot"
  | "calendar-sm";

function GInner({ name, color }: { name: FamilyGlyphName; color: string }) {
  const f = color;
  switch (name) {
    case "members":
      return (
        <>
          <Circle cx={8.5} cy={8} r={3} fill={f} />
          <Circle cx={15.5} cy={9} r={2.5} fill={f} opacity={0.85} />
          <Path d="M3 20c0-3 2.5-5 5.5-5h0c2.2 0 4 1.2 5 3" fill={f} />
          <Path d="M13 20c0-2.2 1.8-4 4-4h.5c2 0 3.5 1.5 3.5 3.5V20" fill={f} opacity={0.85} />
        </>
      );
    case "calendar":
      return (
        <>
          <Rect x={3} y={5} width={18} height={16} rx={3} fill={f} />
          <Rect x={3} y={9} width={18} height={4} fill="#fff" opacity={0.35} />
          <Rect x={7} y={3} width={2.5} height={4} rx={1} fill={f} />
          <Rect x={14.5} y={3} width={2.5} height={4} rx={1} fill={f} />
          <Circle cx={8} cy={15} r={1.2} fill="#fff" />
          <Circle cx={12} cy={15} r={1.2} fill="#fff" />
          <Circle cx={16} cy={15} r={1.2} fill="#fff" />
          <Circle cx={8} cy={18.5} r={1.2} fill="#fff" opacity={0.7} />
        </>
      );
    case "memories":
      return (
        <>
          <Path d="M6 4h8l4 4v14H6V4z" fill={f} />
          <Path d="M14 4v4h4" fill={f} opacity={0.5} />
          <Path d="M9 11l2 2 4-4.5" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      );
    case "settings":
      return (
        <>
          <Path
            d="M12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6zm-7.2 3.8l1.9-.3.4 1.8-1.6 1.1.3 1.9-1.9-.7-1.4 1.4-.7-1.9-1.9-.3 1.1-1.6-1.8.4-1.9-.3-1.4 1.4-1.9-.7 1.9.3 1.1-1.6 1.8-.4z"
            fill={f}
          />
        </>
      );
    case "wallet":
      return (
        <>
          <Rect x={2} y={7} width={20} height={13} rx={3} fill={f} />
          <Rect x={2} y={10} width={20} height={3} fill="#fff" opacity={0.25} />
          <Circle cx={16} cy={14.5} r={2} fill="#fff" />
        </>
      );
    case "child":
      return (
        <>
          <Circle cx={12} cy={9} r={5} fill={f} />
          <Path d="M6 20c0-3.5 2.7-6 6-6s6 2.5 6 6" fill={f} />
          <Circle cx={9.5} cy={8.5} r={0.9} fill="#fff" />
          <Circle cx={14.5} cy={8.5} r={0.9} fill="#fff" />
          <Path d="M10 11.5c.8.8 2.2.8 3 0" stroke="#fff" strokeWidth={1.2} strokeLinecap="round" fill="none" />
        </>
      );
    case "food":
      return (
        <>
          <Path d="M5 10c0-2.8 3.1-5 7-5s7 2.2 7 5v1H5v-1z" fill={f} />
          <Path d="M4 12h16l-1.5 8H5.5L4 12z" fill={f} opacity={0.9} />
          <Path d="M9 6V4M12 5V3M15 6V4" stroke={f} strokeWidth={1.5} strokeLinecap="round" />
        </>
      );
    case "health":
      return (
        <>
          <Circle cx={12} cy={12} r={9} fill={f} opacity={0.15} />
          <Path
            d="M4 13h3l1.5-3 2 6 1.5-3H20"
            stroke={f}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      );
    case "pills":
      return (
        <>
          <Rect x={5} y={8} width={8} height={8} rx={4} fill={f} />
          <Rect x={11} y={10} width={8} height={8} rx={2} fill={f} opacity={0.7} transform="rotate(25 15 14)" />
        </>
      );
    case "stethoscope":
      return (
        <>
          <Path d="M6 6v5a4 4 0 0 0 8 0V6" stroke={f} strokeWidth={2} fill="none" strokeLinecap="round" />
          <Circle cx={17} cy={16} r={3} fill={f} />
          <Path d="M14 16H11a3 3 0 0 1-3-3V6" stroke={f} strokeWidth={2} fill="none" strokeLinecap="round" />
        </>
      );
    case "plane":
      return <Path d="M4 13l8-7 2.5 2.5L20 6l-3.5 9.5H11l-2 3.5-2.5-3H4z" fill={f} />;
    case "home":
      return (
        <>
          <Path d="M4 11.5L12 5l8 6.5V19H4v-7.5z" fill={f} />
          <Rect x={10} y={13} width={4} height={6} rx={0.5} fill="#fff" opacity={0.5} />
          <Circle cx={17} cy={10} r={2} fill="#fff" />
        </>
      );
    case "car":
      return (
        <>
          <Path d="M4 14h16l-1.8-6a2 2 0 0 0-1.9-1.4H7.7A2 2 0 0 0 5.8 8L4 14z" fill={f} />
          <Rect x={6} y={11} width={12} height={3} rx={1} fill="#fff" opacity={0.35} />
          <Circle cx={8} cy={15} r={1.8} fill="#fff" />
          <Circle cx={16} cy={15} r={1.8} fill="#fff" />
        </>
      );
    case "cart":
      return (
        <>
          <Path d="M7 8H5l1.2 11h11.6L19 8H9" fill={f} />
          <Circle cx={9} cy={20} r={1.5} fill={f} />
          <Circle cx={16} cy={20} r={1.5} fill={f} />
        </>
      );
    case "crown":
      return (
        <Path d="M5 16h14L12 6l-2.5 4-2-3.5-2 3.5L5 16zm2 2v2h10v-2" fill={f} />
      );
    case "chevron":
      return <Path d="M9 7l6 5-6 5" stroke={f} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
    case "bell":
      return (
        <>
          <Path d="M12 4a4.5 4.5 0 0 1 4.5 4.5v4.2l2 2.3H5.5l2-2.3V8.5A4.5 4.5 0 0 1 12 4z" fill={f} />
          <Path d="M10 18.5a2 2 0 0 0 4 0" fill={f} />
        </>
      );
    case "camera":
      return (
        <>
          <Rect x={2} y={7} width={20} height={14} rx={3} fill={f} />
          <Circle cx={12} cy={14} r={4} fill="#fff" opacity={0.9} />
        </>
      );
    case "robot":
      return (
        <>
          <Rect x={5} y={8} width={14} height={11} rx={4} fill={f} />
          <Circle cx={9.5} cy={13} r={1.5} fill="#fff" />
          <Circle cx={14.5} cy={13} r={1.5} fill="#fff" />
          <Rect x={10} y={4} width={4} height={3} rx={1} fill={f} />
        </>
      );
    case "calendar-sm":
      return (
        <>
          <Rect x={4} y={5} width={12} height={11} rx={2} fill={f} />
          <Rect x={4} y={8} width={12} height={2} fill="#fff" opacity={0.35} />
        </>
      );
    default:
      return null;
  }
}
