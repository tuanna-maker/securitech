import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { LifeGradientIcon, type LifeGradientIconName } from "./LifeGradientIcon";
import { useTheme } from "../../../hooks/useTheme";
import { textStyle } from "../../../lib/design";

export function FamilyServiceTile({ label, icon, onPress }: { label: string; icon: LifeGradientIconName; onPress: () => void }) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.col}>
      <View style={[styles.box, { backgroundColor: isDark ? colors.card : "#fff", borderColor: colors.border }, shadow(isDark)]}>
        <LifeGradientIcon name={icon} size={36} />
      </View>
      <Text style={[textStyle("caption2"), styles.label, { color: colors.text }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

function shadow(isDark: boolean) {
  return Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 8 },
    android: { elevation: 3 },
    default: {},
  });
}

const styles = StyleSheet.create({
  col: { width: 72, alignItems: "center" },
  box: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  label: { textAlign: "center", lineHeight: 14 },
});
