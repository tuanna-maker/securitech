import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Illustration } from "@stos/mobile-shared";
import { brand } from "../../lib/brand";
import { radii, spacing, textStyle } from "../../lib/design";

const BULLETS = [
  { icon: "headset" as const, text: "Hỗ trợ 24/7 — Có mặt nhanh" },
  { icon: "people" as const, text: "Đội ngũ chuyên nghiệp — Đào tạo bài bản" },
  { icon: "hardware-chip" as const, text: "Công nghệ hiện đại — Giám sát thông minh" },
];

export function SecurityHeroCard() {
  return (
    <LinearGradient colors={[brand.navy, "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.shield}>
          <Ionicons name="shield-checkmark" size={36} color="#fff" />
        </View>
        <View style={styles.illus}>
          <Illustration name="hero-home-shield" width={100} height={80} opacity={0.95} />
        </View>
      </View>
      <Text style={[textStyle("title3", "bold"), styles.title]}>An toàn gia đình là ưu tiên hàng đầu</Text>
      {BULLETS.map((b) => (
        <View key={b.text} style={styles.bullet}>
          <Ionicons name={b.icon} size={16} color={brand.techCyan} />
          <Text style={[textStyle("footnote"), styles.bulletText]}>{b.text}</Text>
        </View>
      ))}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.lg },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  shield: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  illus: { opacity: 0.9 },
  title: { color: "#fff", marginBottom: spacing.md },
  bullet: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 6 },
  bulletText: { color: "rgba(255,255,255,0.92)", flex: 1 },
});
