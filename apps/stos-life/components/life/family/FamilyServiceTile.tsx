import { View, Text, Pressable, StyleSheet } from "react-native";
import { LifeGradientIcon, type LifeGradientIconName } from "./LifeGradientIcon";
import { useTheme } from "../../../hooks/useTheme";
import { cardShadow } from "../../../lib/design";

export function FamilyServiceTile({ label, icon, onPress }: { label: string; icon: LifeGradientIconName; onPress: () => void }) {
  const { life, isDark } = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.col}>
      <View
        style={[
          styles.box,
          { backgroundColor: life.bgCard, borderColor: life.border },
          cardShadow(isDark),
        ]}
      >
        <LifeGradientIcon name={icon} size={30} />
      </View>
      <Text style={[styles.label, { color: life.textSub }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  col: { width: 72, alignItems: "center" },
  box: {
    width: 72,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 6,
    marginBottom: 8,
  },
  label: { fontSize: 11.5, lineHeight: 15, fontWeight: "500", textAlign: "center" },
});
