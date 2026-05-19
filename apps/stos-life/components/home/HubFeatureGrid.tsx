import { View, Text, Pressable, StyleSheet } from "react-native";
import { StosIcon } from "@stos/mobile-shared";
import type { HubItem } from "../../lib/securityHub";
import { useTheme } from "../../hooks/useTheme";
import { cardShadow, radii, spacing, textStyle } from "../../lib/design";

export function HubFeatureGrid({ title, items, onPress }: { title: string; items: HubItem[]; onPress: (item: HubItem) => void }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[textStyle("caption1", "semibold"), styles.label, { color: colors.textTertiary }]}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => onPress(item)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
              cardShadow(isDark),
            ]}
          >
            <View style={[styles.icon, { backgroundColor: item.bg }]}>
              <StosIcon name={item.icon} size={22} color={item.iconColor} />
            </View>
            <Text style={[textStyle("subhead", "semibold"), { color: colors.text }]} numberOfLines={2}>
              {item.label}
            </Text>
            {item.subtitle ? (
              <Text style={[textStyle("caption2"), { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
                {item.subtitle}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xl },
  label: { marginBottom: spacing.sm, marginLeft: spacing.xs },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: spacing.md },
  card: { width: "48%", minHeight: 100, padding: spacing.md, borderRadius: radii.lg, borderWidth: StyleSheet.hairlineWidth },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
});
