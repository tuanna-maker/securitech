import type { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LifeGradientIcon, type LifeGradientIconName } from "./LifeGradientIcon";
import { useTheme } from "../../../hooks/useTheme";

type Props = {
  label: string;
  icon: LifeGradientIconName;
  onPress: () => void;
};

export function FamilyQuickTile({ label, icon, onPress }: Props) {
  const { life } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.slot, pressed && { opacity: 0.88 }]}
      accessibilityRole="button"
      accessibilityLabel={label.replace(/\n/g, " ")}
    >
      <View style={[styles.tile, { backgroundColor: life.bgQuick, borderColor: life.border }]}>
        <LifeGradientIcon name={icon} size={30} />
        <Text style={[styles.label, { color: life.textSub }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function FamilyQuickTileRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  slot: { flex: 1, minWidth: 0 },
  tile: {
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 6,
    minHeight: 86,
  },
  label: {
    marginTop: 7,
    fontSize: 12.5,
    lineHeight: 15,
    fontWeight: "500",
    textAlign: "center",
    width: "100%",
  },
});
