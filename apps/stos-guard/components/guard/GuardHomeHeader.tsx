import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { GuardGlyph } from "./GuardGlyphs";
import { guardPalette } from "../../lib/guardSurfaces";
import { spacing, textStyle } from "../../lib/design";

type Props = { notifyCount?: number };

export function GuardHomeHeader({ notifyCount = 3 }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.brand}>
        <GuardGlyph name="shield-gold" size={36} color={guardPalette.gold} />
        <View>
          <Text style={styles.baoVe}>BẢO VỆ</Text>
          <Text style={styles.residence}>STOS RESIDENCE</Text>
        </View>
      </View>
      <Pressable onPress={() => router.push("/(tabs)/notifications")} style={styles.bell}>
        <GuardGlyph name="bell" size={24} color="#fff" />
        {notifyCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifyCount > 9 ? "9+" : notifyCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  baoVe: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", letterSpacing: 1.2 },
  residence: { fontSize: 11, fontWeight: "600", color: guardPalette.gold, letterSpacing: 0.8, marginTop: 2 },
  bell: { padding: 8 },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
