import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { brand } from "../../lib/brand";
import { cardShadow, radii, spacing, textStyle } from "../../lib/design";

const SYSTEMS = [
  { label: "Camera", status: "Hoạt động", icon: "videocam" as const, ok: true },
  { label: "PCCC", status: "Bình thường", icon: "flame" as const, ok: true },
  { label: "Thang máy", status: "Bình thường", icon: "arrow-up" as const, ok: true },
];

export function SecurityStatusBar() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.card, borderColor: colors.border }, cardShadow(isDark)]}>
      <View style={styles.main}>
        <View style={[styles.shield, { backgroundColor: brand.success + "22" }]}>
          <Ionicons name="shield-checkmark" size={22} color={brand.success} />
        </View>
        <View style={styles.flex}>
          <Text style={[textStyle("subhead", "semibold"), { color: colors.text }]}>Tất cả bình thường</Text>
          <Text style={[textStyle("caption2"), { color: colors.textSecondary }]}>Cập nhật lúc {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</Text>
        </View>
      </View>
      <View style={styles.systems}>
        {SYSTEMS.map((s) => (
          <View key={s.label} style={[styles.pill, { backgroundColor: colors.background }]}>
            <Ionicons name={s.icon} size={16} color={s.ok ? brand.success : colors.warning} />
            <Text style={[textStyle("caption2", "semibold"), { color: colors.text }]}>{s.label}</Text>
            <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>{s.status}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  main: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  shield: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  systems: { flexDirection: "row", gap: spacing.sm },
  pill: { flex: 1, alignItems: "center", padding: spacing.sm, borderRadius: radii.md, gap: 2 },
});
