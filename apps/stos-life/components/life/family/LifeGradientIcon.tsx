import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop, G } from "react-native-svg";

export type LifeGradientIconName =
  | "members"
  | "calendar"
  | "memories"
  | "settings"
  | "wallet"
  | "child"
  | "food"
  | "health"
  | "plane"
  | "home"
  | "car"
  | "cart"
  | "crown";

type Props = { name: LifeGradientIconName; size?: number };

const VB = 48;

/** Icon gradient 3D — khớp mockup (không dùng icon font / stroke phẳng) */
const GRADIENTS: Record<LifeGradientIconName, [string, string, string]> = {
  members: ["#7DD3FC", "#3B82F6", "#1D4ED8"],
  calendar: ["#C4B5FD", "#8B5CF6", "#6D28D9"],
  memories: ["#FDA4AF", "#F43F5E", "#E11D48"],
  settings: ["#86EFAC", "#22C55E", "#15803D"],
  wallet: ["#93C5FD", "#3B82F6", "#1E40AF"],
  child: ["#D8B4FE", "#A855F7", "#7E22CE"],
  food: ["#FDBA74", "#F97316", "#C2410C"],
  health: ["#6EE7B7", "#10B981", "#047857"],
  plane: ["#7DD3FC", "#0EA5E9", "#0369A1"],
  home: ["#6EE7B7", "#14B8A6", "#0F766E"],
  car: ["#FDBA74", "#FB923C", "#EA580C"],
  cart: ["#D8B4FE", "#A78BFA", "#7C3AED"],
  crown: ["#FDE047", "#EAB308", "#CA8A04"],
};

export function LifeGradientIcon({ name, size = 48 }: Props) {
  const id = `lg-${name}`;
  const [c0, c1, c2] = GRADIENTS[name];
  const fill = `url(#${id}-main)`;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`}>
      <Defs>
        <LinearGradient id={`${id}-main`} x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={c0} />
          <Stop offset="0.55" stopColor={c1} />
          <Stop offset="1" stopColor={c2} />
        </LinearGradient>
        <LinearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.45} />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.08} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <G>{render(name, fill, id)}</G>
    </Svg>
  );
}

function render(name: LifeGradientIconName, fill: string, id: string) {
  const shine = `url(#${id}-shine)`;

  switch (name) {
    case "members":
      return (
        <>
          <Path
            d="M27 14a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm-9 1a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z"
            fill={fill}
            opacity={0.92}
          />
          <Path d="M10 36c0-5.2 4.2-9.5 9.5-9.5S29 30.8 29 36" fill={fill} opacity={0.92} />
          <Path d="M20 36c0-4 3.2-7.2 7.2-7.2S34.4 32 34.4 36" fill={fill} />
          <Path d="M14 11 Q20 8 26 11" fill={shine} opacity={0.4} />
        </>
      );
    case "calendar":
      return (
        <>
          <Rect x={9} y={13} width={30} height={27} rx={6} fill={fill} />
          <Rect x={9} y={13} width={30} height={10} rx={6} fill="#fff" opacity={0.32} />
          <Rect x={15} y={7} width={4} height={8} rx={2} fill={fill} />
          <Rect x={29} y={7} width={4} height={8} rx={2} fill={fill} />
          <Circle cx={17} cy={8.5} r={1.4} fill="#fff" />
          <Circle cx={31} cy={8.5} r={1.4} fill="#fff" />
          <Circle cx={17.5} cy={28} r={2.4} fill="#fff" />
          <Circle cx={24.5} cy={28} r={2.4} fill="#fff" />
          <Circle cx={17.5} cy={34.5} r={2.4} fill="#fff" opacity={0.95} />
          <Circle cx={24.5} cy={34.5} r={2.4} fill="#fff" opacity={0.95} />
          <Path d="M11 14 H37" fill={shine} opacity={0.25} />
        </>
      );
    case "memories":
      return (
        <>
          <Path
            d="M19 7 H29 C31.2 7 33 8.8 33 11 V35 L24 41 L15 35 V11 C15 8.8 16.8 7 19 7 Z"
            fill={fill}
          />
          <Path d="M19 7 H29 V13 H23 L19 11 V7 Z" fill="#fff" opacity={0.3} />
          <Path
            d="M24 17.5 L25.9 21.8 L30.5 22.4 L27 25.6 L28 30.2 L24 27.6 L20 30.2 L21 25.6 L17.5 22.4 L22.1 21.8 Z"
            fill="#fff"
          />
          <Path d="M17 9 Q24 6 31 10" fill={shine} opacity={0.38} />
        </>
      );
    case "settings":
      return (
        <>
          <Path
            fill={fill}
            fillRule="evenodd"
            d="M24 11.5 L25.8 18.4 L32.6 16.8 L29.9 23.1 L35.5 24 L29.9 24.9 L32.6 31.2 L25.8 29.6 L24 36.5 L22.2 29.6 L15.4 31.2 L18.1 24.9 L12.5 24 L18.1 23.1 L15.4 16.8 L22.2 18.4 Z M24 20.2 A3.8 3.8 0 1 0 24 27.8 A3.8 3.8 0 1 0 24 20.2 Z"
          />
          <Circle cx={24} cy={24} r={2.5} fill="#fff" opacity={0.4} />
          <Path d="M15 13 Q24 9 33 14" fill={shine} opacity={0.35} />
        </>
      );
    case "wallet":
      return (
        <>
          <Rect x={8} y={14} width={32} height={22} rx={5} fill={fill} />
          <Rect x={8} y={20} width={32} height={5} fill="#fff" opacity={0.25} />
          <Circle cx={32} cy={26} r={3.5} fill="#fff" opacity={0.9} />
          <Path d="M10 16 Q24 12 38 16" fill={shine} opacity={0.35} />
        </>
      );
    case "child":
      return (
        <>
          <Circle cx={24} cy={17} r={9} fill={fill} />
          <Path d="M12 38c0-7 5.5-12 12-12s12 5 12 12" fill={fill} />
          <Circle cx={20} cy={15} r={1.8} fill="#fff" />
          <Circle cx={28} cy={15} r={1.8} fill="#fff" />
          <Path d="M20 20 Q24 23 28 20" stroke="#fff" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        </>
      );
    case "food":
      return (
        <>
          <Path d="M14 18c0-5 4.5-9 10-9s10 4 10 9v2H14v-2z" fill={fill} />
          <Path d="M12 22h24l-2 14H14l-2-14z" fill={fill} opacity={0.9} />
          <Path d="M18 12v-4M24 13v-5M30 12v-4" stroke={fill} strokeWidth={2} strokeLinecap="round" />
        </>
      );
    case "health":
      return (
        <>
          <Circle cx={24} cy={24} r={16} fill={fill} opacity={0.25} />
          <Path
            d="M10 26h6l3-6 4 12 3-6h12"
            stroke={fill}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      );
    case "plane":
      return <Path d="M8 28 L26 10 l5 6 11-8-7 18H22l-4 8-5-7H8z" fill={fill} />;
    case "home":
      return (
        <>
          <Path d="M10 22 L24 10 l14 12 v14 H10 Z" fill={fill} />
          <Rect x={20} y={26} width={8} height={10} rx={1} fill="#fff" opacity={0.35} />
        </>
      );
    case "car":
      return (
        <>
          <Path d="M8 28h32l-3.5-12a3 3 0 0 0-2.8-2.2H14.3A3 3 0 0 0 11.5 16L8 28z" fill={fill} />
          <Circle cx={16} cy={29} r={3.5} fill="#fff" />
          <Circle cx={32} cy={29} r={3.5} fill="#fff" />
        </>
      );
    case "cart":
      return (
        <>
          <Path d="M14 16H11l2.5 22h21L36 16H18" fill={fill} />
          <Circle cx={18} cy={40} r={2.5} fill={fill} />
          <Circle cx={30} cy={40} r={2.5} fill={fill} />
        </>
      );
    case "crown":
      return (
        <Path
          d="M10 30h28L24 12l-4 7-4-6-4 6-4-7zm3 4v4h18v-4"
          fill={fill}
        />
      );
    default:
      return null;
  }
}
