import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { brand, gradients } from "../../lib/brand";
import { cardShadow, radii, spacing, textStyle } from "../../lib/design";
import { useTheme } from "../../hooks/useTheme";

export function SecurityDualActions({
  onCallSupport,
  onMessage,
}: {
  onCallSupport: () => void;
  onMessage: () => void;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.row}>
      <Pressable onPress={onCallSupport} style={({ pressed }) => [{ flex: 1, opacity: pressed ? 0.9 : 1 }]}>
        <LinearGradient colors={[...gradients.grab]} style={styles.callCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="call" size={22} color="#fff" />
          </View>
          <View style={styles.flex}>
            <Text style={[textStyle("subhead", "bold"), styles.white]}>Gọi hỗ trợ ngay</Text>
            <Text style={[textStyle("caption2"), styles.whiteDim]}>Nhấn để gọi đội bảo an</Text>
          </View>
        </LinearGradient>
      </Pressable>
      <Pressable
        onPress={onMessage}
        style={({ pressed }) => [
          styles.msgCard,
          { backgroundColor: isDark ? "#1E293B" : colors.card, borderColor: colors.border },
          cardShadow(isDark),
          { opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: brand.navy + "22" }]}>
          <Ionicons name="chatbubble-ellipses" size={22} color={brand.navy} />
        </View>
        <View style={styles.flex}>
          <Text style={[textStyle("subhead", "bold"), { color: colors.text }]}>Nhắn tin bảo an</Text>
          <Text style={[textStyle("caption2"), { color: colors.textSecondary }]}>Trao đổi · Yêu cầu</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  callCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    minHeight: 72,
  },
  msgCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 72,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  white: { color: "#fff" },
  whiteDim: { color: "rgba(255,255,255,0.85)" },
});
