import { View, Text, StyleSheet } from "react-native";
import { textStyle } from "../../design/layout";

const tones = {
  default: { bg: "rgba(120,120,128,0.16)", fg: "#3C3C43" },
  success: { bg: "rgba(52,199,89,0.15)", fg: "#248A3D" },
  warning: { bg: "rgba(255,149,0,0.15)", fg: "#C93400" },
  danger: { bg: "rgba(255,59,48,0.15)", fg: "#D70015" },
  info: { bg: "rgba(0,122,255,0.15)", fg: "#0040DD" },
} as const;

export function Badge({ label, tone = "default" }: { label: string; tone?: keyof typeof tones }) {
  const c = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[textStyle("caption2", "semibold"), { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start" } });
