import { View, Text, Pressable, StyleSheet, Image, type ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { FamilyGlyph } from "./FamilyGlyphs";
import { SystemLogo } from "../../brand/SystemLogo";
import { useTheme } from "../../../hooks/useTheme";
import { spacing, textStyle } from "../../../lib/design";

type Props = {
  title: string;
  notifyCount?: number;
  avatarUrl?: string | null;
  avatarFallback?: ImageSourcePropType;
};

/** HTML topbar: brand | title | bell + avatar */
export function FamilyTabHeader({ title, notifyCount = 0, avatarUrl, avatarFallback }: Props) {
  const { colors, life } = useTheme();

  return (
    <View style={styles.topbar}>
      <View style={styles.brand}>
        <LinearGradient colors={["#42a3ff", "#1a6cec"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBox}>
          <SystemLogo width={20} variant="emblem" />
        </LinearGradient>
        <View style={styles.brandText}>
          <Text style={[styles.brandName, { color: colors.text }]}>STOS Life</Text>
          <Text style={[styles.brandSub, { color: life.textSub }]}>Vì cuộc sống an tâm</Text>
        </View>
      </View>

      <Text style={[styles.pageTitle, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.topRight}>
        <Pressable onPress={() => router.push("/community-feed" as never)} hitSlop={10} style={styles.bellWrap}>
          <FamilyGlyph name="bell" size={22} color={colors.text} />
          {notifyCount > 0 ? (
            <View style={[styles.badge, { borderColor: life.bgPhone }]}>
              <Text style={styles.badgeText}>{notifyCount > 9 ? "9+" : notifyCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable onPress={() => router.push("/(tabs)/account")} style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={[styles.avaCircle, { borderColor: life.bgPhone }]} />
          ) : avatarFallback ? (
            <Image source={avatarFallback} style={[styles.avaCircle, { borderColor: life.bgPhone }]} />
          ) : (
            <View style={[styles.avaCircle, { backgroundColor: "#e2b492", borderColor: life.bgPhone }]} />
          )}
          <View style={[styles.chevron, { borderColor: life.textSub }]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
    paddingBottom: 10,
    marginBottom: spacing.sm,
  },
  brand: { flex: 1, flexDirection: "row", alignItems: "center", gap: 9, minWidth: 0 },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { flexShrink: 1 },
  brandName: { fontSize: 16, fontWeight: "800", lineHeight: 18 },
  brandSub: { fontSize: 11, lineHeight: 14, marginTop: 1 },
  pageTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
    maxWidth: 120,
  },
  topRight: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 14 },
  bellWrap: { padding: 2 },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ff3b30",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 8, fontWeight: "700" },
  avatarWrap: { flexDirection: "row", alignItems: "center", gap: 7 },
  avaCircle: { width: 42, height: 42, borderRadius: 21, borderWidth: 2.5 },
  chevron: {
    width: 9,
    height: 9,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "45deg" }],
    marginTop: -5,
  },
});
