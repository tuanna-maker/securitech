import { Pressable, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { hairlineBorder, spacing, textStyle, touchTarget } from "../../lib/design";

export function ListRow({
  title,
  subtitle,
  right,
  icon,
  onPress,
  showChevron,
  isLast = false,
}: {
  title: string;
  subtitle?: string;
  right?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  showChevron?: boolean;
  onPress?: () => void;
  isLast?: boolean;
}) {
  const { colors } = useTheme();
  const chevron = showChevron ?? !!onPress;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.groupedBackground, opacity: pressed && onPress ? 0.65 : 1 },
        !isLast && hairlineBorder(colors.separator),
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.fill }]}>
          <Ionicons name={icon} size={18} color={colors.tint} />
        </View>
      ) : null}
      <View style={styles.flex}>
        <Text style={[textStyle("body"), { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[textStyle("footnote"), { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? (
        <Text style={[textStyle("body"), { color: colors.textTertiary, marginRight: chevron ? 4 : 0 }]}>
          {right}
        </Text>
      ) : null}
      {chevron && onPress ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    minHeight: touchTarget,
    paddingVertical: spacing.md,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  flex: { flex: 1, marginRight: spacing.sm },
});
