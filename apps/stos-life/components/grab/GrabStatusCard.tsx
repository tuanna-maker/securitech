import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { brand, gradients } from "../../lib/brand";
import { radii, spacing, textStyle } from "../../lib/design";

const STATUS_STYLE: Record<string, { icon: keyof typeof Ionicons.glyphMap; colors: readonly [string, string] }> = {
  submitted: { icon: "search", colors: gradients.primary },
  accepted: { icon: "checkmark-circle", colors: gradients.primary },
  en_route: { icon: "navigate", colors: ["#2563EB", "#1E3066"] },
  on_site: { icon: "person", colors: ["#059669", "#047857"] },
  completed: { icon: "ribbon", colors: gradients.primary },
  cancelled: { icon: "close-circle", colors: ["#64748B", "#475569"] },
  expired: { icon: "time", colors: gradients.grab },
};

export function GrabStatusCard({ status, label, guardName }: { status: string; label: string; guardName?: string }) {
  const meta = STATUS_STYLE[status] ?? STATUS_STYLE.submitted;

  return (
    <LinearGradient colors={[...meta.colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name={meta.icon} size={32} color="#fff" />
      </View>
      <Text style={[textStyle("title2", "bold"), styles.status]}>{label}</Text>
      {guardName ? (
        <Text style={[textStyle("subhead"), styles.guard]}>Anh {guardName} đang hỗ trợ bạn</Text>
      ) : (
        <Text style={[textStyle("subhead"), styles.guard]}>Đang kết nối anh bảo vệ gần nhất…</Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  status: { color: "#fff", textAlign: "center" },
  guard: { color: "rgba(255,255,255,0.9)", marginTop: spacing.sm, textAlign: "center" },
});
