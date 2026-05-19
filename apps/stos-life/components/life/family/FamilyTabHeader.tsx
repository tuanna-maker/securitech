import { View, Text, Pressable, StyleSheet, Image, type ImageSourcePropType } from "react-native";
import { router } from "expo-router";
import { FamilyGlyph } from "./FamilyGlyphs";
import { SystemLogo } from "../../brand/SystemLogo";
import { useTheme } from "../../../hooks/useTheme";
import { brand } from "../../../lib/brand";
import { spacing, textStyle } from "../../../lib/design";

type Props = {
  title: string;
  notifyCount?: number;
  avatarUrl?: string | null;
  avatarFallback?: ImageSourcePropType;
};

/** Header tab Gia đình — logo trên, hàng title + chuông + avatar */
export function FamilyTabHeader({ title, notifyCount = 0, avatarUrl, avatarFallback }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.logoRow}>
        <SystemLogo width={34} variant="emblem" />
        <View>
          <Text style={[textStyle("subhead", "bold"), { color: "#2563EB" }]}>STOS Life</Text>
          <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>Vì cuộc sống an tâm</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <View style={styles.side} />
        <Text style={[textStyle("title3", "bold"), styles.centerTitle, { color: colors.text }]}>{title}</Text>
        <View style={[styles.side, styles.actions]}>
          <Pressable onPress={() => router.push("/community-feed" as never)} hitSlop={10} style={styles.bellWrap}>
            <FamilyGlyph name="bell" size={22} color={colors.text} />
            {notifyCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifyCount}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/account")} style={styles.avatarBtn}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : avatarFallback ? (
              <Image source={avatarFallback} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarImg, { backgroundColor: colors.fill }]} />
            )}
            <FamilyGlyph name="chevron" size={12} color={colors.textTertiary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  titleRow: { flexDirection: "row", alignItems: "center" },
  side: { width: 88 },
  centerTitle: { flex: 1, textAlign: "center" },
  actions: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 },
  bellWrap: { padding: 6 },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  avatarBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  avatarImg: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: "#fff" },
});
