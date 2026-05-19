import { View, Text, StyleSheet } from "react-native";
import { statusColors } from "../../lib/theme";
import { radii, textStyle } from "../../lib/design";

export function Badge({ label, status = "normal" }: { label: string; status?: string }) {
  const c = statusColors[status] || statusColors.normal;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[textStyle("caption2", "semibold"), { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    alignSelf: "flex-start",
  },
});
