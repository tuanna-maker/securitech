import { View, Text, Pressable, StyleSheet } from "react-native";
import { StosIcon, iconTileStyle, type StosIconName } from "@stos/mobile-shared";
import { useTheme } from "../../hooks/useTheme";
import { textStyle } from "../../lib/design";

type Props = {
  name: StosIconName;
  label?: string;
  bg: string;
  color: string;
  size?: number;
  iconSize?: number;
  onPress?: () => void;
  variant?: "tile" | "circle";
};

/** Ô icon pastel + glyph màu — khớp mockup Life */
export function IconChip({ name, label, bg, color, size = 52, iconSize = 26, onPress, variant = "tile" }: Props) {
  const { colors } = useTheme();
  const radius = variant === "circle" ? size / 2 : 14;

  const box = (
    <View style={styles.col}>
      <View style={[iconTileStyle(bg, size, radius), styles.innerGlow]}>
        <StosIcon name={name} size={iconSize} color={color} variant="filled" />
      </View>
      {label ? (
        <Text style={[textStyle("caption2", "semibold"), styles.label, { color: colors.text }]} numberOfLines={2}>
          {label}
        </Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
        {box}
      </Pressable>
    );
  }
  return box;
}

const styles = StyleSheet.create({
  col: { alignItems: "center", gap: 8, maxWidth: 80 },
  innerGlow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
  },
  label: { textAlign: "center", lineHeight: 14 },
});
