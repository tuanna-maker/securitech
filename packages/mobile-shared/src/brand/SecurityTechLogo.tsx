import Svg, { Circle, Path, Rect, Text as SvgText, G, Defs, LinearGradient, Stop } from "react-native-svg";
import { View, StyleSheet } from "react-native";

type Variant = "full" | "emblem" | "wordmark";

type Props = {
  width?: number;
  variant?: Variant;
};

const ASPECT = { full: 400 / 520, emblem: 1, wordmark: 400 / 90 } as const;

/** Vector Security Tech logo (no corner badge). */
export function SecurityTechLogo({ width = 240, variant = "full" }: Props) {
  const height = Math.round(width / ASPECT[variant]);

  if (variant === "emblem") {
    return (
      <View style={[styles.wrap, { width, height }]}>
        <Svg width={width} height={height} viewBox="0 0 120 120">
          <Defs>
            <LinearGradient id="sg1" x1="60" y1="10" x2="60" y2="110" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor="#2E4BB0" />
              <Stop offset="1" stopColor="#1E3066" />
            </LinearGradient>
            <LinearGradient id="sg2" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#00AEEF" />
              <Stop offset="1" stopColor="#1E3066" />
            </LinearGradient>
          </Defs>
          <Path d="M60 12 L98 30 V58 C98 78 60 98 60 98 C60 98 22 78 22 58 V30 Z" fill="none" stroke="url(#sg1)" strokeWidth={3.5} />
          <Path d="M38 48 L48 42 L48 68 L38 72 Z" fill="#2E4BB0" />
          <Path d="M52 36 H68 V72 H52 Z" fill="url(#sg2)" />
          <Rect x={54} y={42} width={4} height={4} fill="#fff" />
          <Rect x={60} y={42} width={4} height={4} fill="#fff" />
          <Rect x={66} y={42} width={4} height={4} fill="#fff" />
          <Path d="M72 50 L82 54 L82 70 L72 66 Z" fill="#2E4BB0" />
          <Path d="M28 68 H92" stroke="#00AEEF" strokeWidth={2} />
          <Circle cx={28} cy={68} r={2.5} fill="#00AEEF" />
          <Circle cx={92} cy={68} r={2.5} fill="#00AEEF" />
        </Svg>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 400 520">
        <Defs>
          <LinearGradient id="shieldStroke" x1="200" y1="40" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#2E4BB0" />
            <Stop offset="1" stopColor="#1E3066" />
          </LinearGradient>
          <LinearGradient id="towerMain" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#00AEEF" />
            <Stop offset="1" stopColor="#1E3066" />
          </LinearGradient>
        </Defs>
        <G transform="translate(200, 118)">
          <Path
            d="M0 -58 L52 -34 V18 C52 42 0 62 0 62 C0 62 -52 42 -52 18 V-34 Z"
            fill="none"
            stroke="url(#shieldStroke)"
            strokeWidth={5}
          />
          <Path d="M-38 8 L-22 0 L-22 32 L-38 38 Z" fill="#2E4BB0" />
          <Path d="M-14 -6 L14 -6 L14 34 L-14 34 Z" fill="url(#towerMain)" />
          <Rect x={-10} y={2} width={5} height={5} fill="#fff" />
          <Rect x={-2} y={2} width={5} height={5} fill="#fff" />
          <Rect x={6} y={2} width={5} height={5} fill="#fff" />
          <Path d="M22 4 L38 10 L38 36 L22 30 Z" fill="#2E4BB0" />
          <Path d="M-44 38 H44" stroke="#00AEEF" strokeWidth={2.5} />
          <Circle cx={-44} cy={38} r={3.5} fill="#00AEEF" />
          <Circle cx={44} cy={38} r={3.5} fill="#00AEEF" />
        </G>
        {variant === "full" && (
          <>
            <SvgText x={200} y={248} textAnchor="middle" fontWeight="700" fontSize={32} fill="#1E3066">
              SECURITY TECH
            </SvgText>
            <SvgText x={200} y={278} textAnchor="middle" fontWeight="600" fontSize={11} fill="#1E3066">
              SMART SECURITY. BETTER LIVING.
            </SvgText>
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
