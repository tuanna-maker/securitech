import { ScrollView, Pressable, View, Text, StyleSheet } from "react-native";
import { StosIcon } from "@stos/mobile-shared";
import type { HubItem } from "../../lib/securityHub";
import { useTheme } from "../../hooks/useTheme";
import { spacing, textStyle } from "../../lib/design";

export function HubIconScroller({ title, items, onPress }: { title: string; items: HubItem[]; onPress: (item: HubItem) => void }) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[textStyle("caption1", "semibold"), styles.label, { color: colors.textTertiary }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {items.map((item) => (
          <Pressable key={item.key} onPress={() => onPress(item)} style={styles.item}>
            <View style={[styles.circle, { backgroundColor: item.bg }]}>
              <StosIcon name={item.icon} size={24} color={item.iconColor} />
            </View>
            <Text style={[textStyle("caption2"), { color: colors.text, textAlign: "center" }]} numberOfLines={2}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.sm, marginLeft: spacing.xs },
  scroll: { gap: spacing.md, paddingRight: spacing.lg },
  item: { width: 72, alignItems: "center", gap: spacing.sm },
  circle: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
});
