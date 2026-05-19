import { Pressable, Text, StyleSheet, View, type ViewStyle } from "react-native";
import { StosIcon } from "../icons/StosIcon";
import type { StosIconName } from "../icons/types";

type Props = {
  name: StosIconName;
  label?: string;
  bg: string;
  color: string;
  size?: number;
  iconSize?: number;
  onPress?: () => void;
  style?: ViewStyle;
};

/** Ô icon vuông bo góc — đúng mockup (nền pastel + glyph màu) */
export function StosIconTile({ name, label, bg, color, size = 52, iconSize = 26, onPress, style }: Props) {
  const inner = (
    <View style={[styles.wrap, style]}>
      <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.26, backgroundColor: bg }]}>
        <StosIcon name={name} size={iconSize} color={color} />
      </View>
      {label ? <Text style={styles.label} numberOfLines={2}>{label}</Text> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 8 },
  box: { alignItems: "center", justifyContent: "center" },
  label: { fontSize: 12, fontWeight: "600", color: "#334155", textAlign: "center" },
});
