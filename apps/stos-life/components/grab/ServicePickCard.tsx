import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { getGrabServiceMeta } from "../../lib/grabServices";
import { brand } from "../../lib/brand";
import { cardShadow, radii, spacing, textStyle } from "../../lib/design";

export function ServicePickCard({
  code,
  label,
  selected,
  onPress,
}: {
  code: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, isDark } = useTheme();
  const meta = getGrabServiceMeta(code);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: selected ? brand.navyLight : colors.border,
          borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
          opacity: pressed ? 0.88 : 1,
        },
        cardShadow(isDark),
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
        <Ionicons name={meta.icon} size={24} color={meta.iconColor} />
      </View>
      <View style={styles.body}>
        <Text style={[textStyle("body", "semibold"), { color: colors.text }]}>{label}</Text>
        <Text style={[textStyle("footnote"), { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
          {meta.subtitle}
        </Text>
      </View>
      <View
        style={[
          styles.check,
          {
            borderColor: selected ? brand.navyLight : colors.border,
            backgroundColor: selected ? brand.navyLight : "transparent",
          },
        ]}
      >
        {selected ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
