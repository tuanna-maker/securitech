import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../../hooks/useTheme";
import { brand } from "../../lib/brand";
import { spacing, textStyle } from "../../lib/design";

export function HomeTopBar({ notifyCount = 0 }: { notifyCount?: number }) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.flex}>
        <Text style={[textStyle("title2", "bold"), { color: colors.text }]}>Dịch vụ bảo an</Text>
        <View style={styles.subRow}>
          <Ionicons name="shield-checkmark" size={14} color={brand.techCyan} />
          <Text style={[textStyle("footnote"), { color: colors.textSecondary }]}>An tâm mỗi ngày</Text>
        </View>
      </View>
      <Pressable onPress={() => router.push("/(tabs)/community")} style={styles.iconBtn}>
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
        {notifyCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifyCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: spacing.lg },
  flex: { flex: 1 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  iconBtn: { padding: spacing.xs },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
});
