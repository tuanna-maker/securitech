import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { GuardGlyph } from "../guard/GuardGlyphs";
import { guardCard, guardPalette } from "../../lib/guardSurfaces";
import { spacing, textStyle } from "../../lib/design";

const AVATAR = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop";

export function GuardProfileCard({
  name,
  shiftLabel,
  onDuty,
}: {
  name: string;
  shiftLabel: string;
  onDuty: boolean;
}) {
  return (
    <View style={[styles.card, guardCard()]}>
      <Image source={{ uri: AVATAR }} style={styles.avatar} />
      <View style={styles.body}>
        <Text style={[textStyle("headline", "semibold"), { color: "#fff" }]}>Xin chào, {name}</Text>
        <Text style={[textStyle("footnote"), { color: guardPalette.cardBorder, marginTop: 4 }]}>{shiftLabel}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: onDuty ? "#34C759" : "#64748B" }]} />
          <Text style={[textStyle("caption1", "semibold"), { color: onDuty ? "#34C759" : "#94A3B8" }]}>
            {onDuty ? "Đang làm việc" : "Chưa vào ca"}
          </Text>
        </View>
      </View>
      <GuardGlyph name="chevron-right" size={18} color="#64748B" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: guardPalette.cardBorder },
  body: { flex: 1 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
