import { Pressable, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { radii, spacing, textStyle, touchTarget } from "../../lib/design";

export function ActionTile({
  label,
  icon,
  bg,
  iconColor,
  onPress,
  highlight,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  iconColor: string;
  onPress: () => void;
  highlight?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: highlight ? colors.danger + "18" : colors.card,
          borderColor: highlight ? colors.danger + "55" : colors.border,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>
      <Text style={[textStyle("footnote", "semibold"), { color: colors.text, textAlign: "center" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: "47%",
    minHeight: 96,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});
