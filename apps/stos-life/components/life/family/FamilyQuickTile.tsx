import type { ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LifeGradientIcon, type LifeGradientIconName } from "./LifeGradientIcon";

const TILE_H = 86;
const TILE_RADIUS = 16;
const TILE_GAP = 8;

type Props = {
  label: string;
  icon: LifeGradientIconName;
  onPress: () => void;
};

/**
 * 4 ô quick action trong thẻ hồ sơ — chỉ viền nhẹ, không shadow riêng (tránh “nổi” xấu).
 */
export function FamilyQuickTile({ label, icon, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.slot, pressed && { opacity: 0.88 }]}
      accessibilityRole="button"
      accessibilityLabel={label.replace(/\n/g, " ")}
    >
      <View style={styles.tile}>
        <LifeGradientIcon name={icon} size={42} />
        <Text style={styles.label} numberOfLines={2} ellipsizeMode="clip">
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
  row: {
    flexDirection: "row",
    gap: TILE_GAP,
  },
  slot: {
    flex: 1,
    minWidth: 0,
  },
  tile: {
    height: TILE_H,
    borderRadius: TILE_RADIUS,
    borderWidth: 1,
    borderColor: "#E8EBF0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 2,
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "500",
    color: "#1E293B",
    textAlign: "center",
    width: "100%",
  },
});
