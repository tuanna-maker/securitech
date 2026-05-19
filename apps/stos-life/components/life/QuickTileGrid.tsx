import { View, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { StosIcon, mockCardStyle, type StosIconName } from "@stos/mobile-shared";
import { useTheme } from "../../hooks/useTheme";
import { radii, spacing, textStyle } from "../../lib/design";
import { Text } from "react-native";

export type QuickTile = {
  key: string;
  label: string;
  icon: StosIconName;
  bg: string;
  color: string;
  onPress: () => void;
};

export function QuickTileGrid({ tiles, columns = 3 }: { tiles: QuickTile[]; columns?: number }) {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const gap = 12;
  const pad = spacing.lg * 2;
  const tileW = (width - pad - gap * (columns - 1)) / columns;

  return (
    <View style={[styles.grid, { gap }]}>
      {tiles.map((t) => (
        <Pressable
          key={t.key}
          onPress={t.onPress}
          style={({ pressed }) => [
            styles.tile,
            mockCardStyle({ isDark, backgroundColor: colors.card, borderColor: colors.border, radius: radii.lg }),
            { width: tileW, opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: t.bg }]}>
            <StosIcon name={t.icon} size={26} color={t.color} variant="filled" />
          </View>
          <Text style={[textStyle("caption1", "semibold"), { color: colors.text, textAlign: "center" }]} numberOfLines={2}>
            {t.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap" },
  tile: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 108,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
  },
});
