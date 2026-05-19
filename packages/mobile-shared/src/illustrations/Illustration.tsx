import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { View, StyleSheet } from "react-native";
import { brand } from "../design/theme";

export type IllustrationName =
  | "empty-guests"
  | "empty-parcels"
  | "empty-sos"
  | "empty-farm"
  | "empty-grab"
  | "empty-history"
  | "empty-attendance"
  | "empty-patrol"
  | "empty-queue"
  | "empty-notifications"
  | "error-network"
  | "error-timeout"
  | "hero-home-shield"
  | "activate-code"
  | "onboarding-security"
  | "onboarding-amenities"
  | "onboarding-community";

const C = brand.illustration;

type Props = { name: IllustrationName; width?: number; height?: number; opacity?: number };

export function Illustration({ name, width = 120, height = 100, opacity = 1 }: Props) {
  return (
    <View style={[styles.wrap, { opacity }]} accessibilityIgnoresInvertColors>
      <Svg width={width} height={height} viewBox="0 0 120 100">
        {render(name)}
      </Svg>
    </View>
  );
}

function render(name: IllustrationName) {
  switch (name) {
    case "hero-home-shield":
    case "onboarding-security":
      return (
        <>
          <Path d="M60 12 L88 28 V52 C88 68 60 82 60 82 C60 82 32 68 32 52 V28 Z" fill={C.fillMid} stroke={C.stroke} strokeWidth={2} />
          <Rect x={44} y={38} width={14} height={22} rx={2} fill={C.fillLight} />
          <Rect x={60} y={32} width={16} height={28} rx={2} fill={C.fillPale} />
          <Rect x={52} y={58} width={16} height={8} rx={2} fill={C.fillDark} />
        </>
      );
    case "activate-code":
      return (
        <>
          <Rect x={28} y={20} width={64} height={48} rx={8} fill={C.fillPale} stroke={C.stroke} strokeWidth={1.5} />
          <Rect x={38} y={32} width={44} height={6} rx={3} fill={C.fillMid} />
          <Rect x={38} y={44} width={32} height={6} rx={3} fill={C.fillLight} />
          <Circle cx={88} cy={72} r={14} fill={C.fillLight} />
          <Path d="M88 64 V72 M84 68 H92" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        </>
      );
    case "empty-guests":
      return (
        <>
          <Circle cx={42} cy={40} r={12} fill={C.fillMid} />
          <Circle cx={72} cy={44} r={10} fill={C.fillLight} />
          <Path d="M28 72 Q42 58 56 72 T84 72" fill={C.fillPale} />
        </>
      );
    case "empty-parcels":
      return (
        <>
          <Rect x={34} y={28} width={52} height={40} rx={6} fill={C.fillMid} />
          <Path d="M34 36 H86" stroke={C.fillDark} strokeWidth={2} />
          <Rect x={48} y={48} width={24} height={8} rx={2} fill={C.fillLight} />
        </>
      );
    case "empty-sos":
      return (
        <>
          <Circle cx={60} cy={48} r={28} fill="#FEE2E2" />
          <Path d="M60 32 V52 M60 58 V62" stroke="#DC2626" strokeWidth={4} strokeLinecap="round" />
        </>
      );
    case "empty-farm":
      return (
        <>
          <Ellipse cx={60} cy={72} rx={40} ry={8} fill={C.fillPale} opacity={0.5} />
          <Path d="M48 70 V42 Q60 28 72 42 V70" fill="#22C55E" opacity={0.85} />
          <Circle cx={60} cy={36} r={8} fill={C.fillLight} />
        </>
      );
    case "empty-grab":
    case "empty-history":
      return (
        <>
          <Rect x={30} y={32} width={60} height={36} rx={8} fill={C.fillMid} />
          <Circle cx={42} cy={78} r={8} fill={C.fillDark} />
          <Circle cx={78} cy={78} r={8} fill={C.fillDark} />
        </>
      );
    case "empty-attendance":
      return (
        <>
          <Rect x={36} y={24} width={48} height={56} rx={8} fill={C.fillPale} stroke={C.stroke} strokeWidth={1.5} />
          <Circle cx={60} cy={48} r={14} fill={C.fillLight} />
          <Path d="M54 48 L58 52 L66 44" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" />
        </>
      );
    case "empty-patrol":
      return (
        <>
          <Path d="M24 70 L48 40 L72 55 L96 30" stroke={C.fillLight} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Circle cx={96} cy={30} r={6} fill={C.fillMid} />
        </>
      );
    case "empty-queue":
      return (
        <>
          <Rect x={28} y={28} width={64} height={10} rx={4} fill={C.fillPale} />
          <Rect x={28} y={44} width={52} height={10} rx={4} fill={C.fillMid} />
          <Rect x={28} y={60} width={44} height={10} rx={4} fill={C.fillLight} />
        </>
      );
    case "empty-notifications":
      return (
        <>
          <Path d="M48 28 H72 C78 28 82 34 82 40 V58 L88 68 H32 L38 58 V40 C38 34 42 28 48 28 Z" fill={C.fillMid} />
          <Circle cx={78} cy={32} r={6} fill={brand.orange} />
        </>
      );
    case "error-network":
      return (
        <>
          <Circle cx="60" cy="48" r="32" fill={C.fillPale} />
          <Path d="M40 48 H80 M60 28 V68" stroke={C.fillMid} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
          <Path d="M44 56 L76 40" stroke="#DC2626" strokeWidth={3} strokeLinecap="round" />
        </>
      );
    case "error-timeout":
      return (
        <>
          <Circle cx="60" cy="52" r="28" fill={C.fillPale} stroke={C.stroke} strokeWidth={2} />
          <Path d="M60 36 V52 L72 60" stroke={C.fillMid} strokeWidth={3} strokeLinecap="round" />
        </>
      );
    case "onboarding-amenities":
      return (
        <>
          <Rect x={32} y={36} width={56} height={40} rx={6} fill={C.fillMid} />
          <Rect x={42} y={46} width={12} height={12} rx={2} fill={C.fillLight} />
          <Rect x={58} y={46} width={12} height={12} rx={2} fill={C.fillLight} />
        </>
      );
    case "onboarding-community":
      return (
        <>
          <Circle cx={48} cy={42} r={10} fill={C.fillMid} />
          <Circle cx={72} cy={42} r={10} fill={C.fillLight} />
          <Path d="M32 72 Q60 56 88 72" fill={C.fillPale} />
        </>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
