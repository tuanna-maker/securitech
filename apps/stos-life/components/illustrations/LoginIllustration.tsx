import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { View, StyleSheet } from "react-native";

/** Minh họa đăng nhập — tòa nhà + shield (Life) */
export function LoginIllustration({ variant = "life" }: { variant?: "life" | "guard" }) {
  const accent = variant === "guard" ? "#F58220" : "#EF4444";
  return (
    <View style={styles.wrap} accessibilityIgnoresInvertColors>
      <Svg width={280} height={160} viewBox="0 0 280 160">
        <Ellipse cx={140} cy={145} rx={110} ry={12} fill="rgba(30,48,102,0.12)" />
        <Rect x={70} y={55} width={140} height={85} rx={8} fill="#2E4BB0" opacity={0.9} />
        <Rect x={85} y={70} width={28} height={28} rx={4} fill="#93C5FD" opacity={0.8} />
        <Rect x={120} y={70} width={28} height={28} rx={4} fill="#93C5FD" opacity={0.8} />
        <Rect x={155} y={70} width={28} height={28} rx={4} fill="#93C5FD" opacity={0.8} />
        <Rect x={100} y={108} width={80} height={32} rx={4} fill="#1E3066" />
        <Path d="M140 25 L175 55 L105 55 Z" fill="#1E3066" />
        <Circle cx={200} cy={95} r={32} fill={accent} opacity={0.95} />
        <Path
          d="M200 78 L210 88 L200 112 L190 88 Z"
          fill="#fff"
          transform="translate(0, 4)"
        />
        {variant === "guard" ? (
          <Rect x={48} y={88} width={36} height={44} rx={6} fill="#F58220" opacity={0.85} />
        ) : (
          <Circle cx={52} cy={100} r={22} fill="#22C55E" opacity={0.9} />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingVertical: 8 },
});
