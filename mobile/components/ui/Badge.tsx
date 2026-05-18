import { View, Text, StyleSheet } from "react-native";
import { statusColors } from "../../lib/theme";

export function Badge({ label, status = "normal" }: { label: string; status?: string }) {
  const c = statusColors[status] || statusColors.normal;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start" },
  text: { fontSize: 11, fontWeight: "600" },
});
