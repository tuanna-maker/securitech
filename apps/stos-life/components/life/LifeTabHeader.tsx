import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SystemLogo } from "../brand/SystemLogo";
import { useTheme } from "../../hooks/useTheme";
import { brand } from "../../lib/brand";
import { spacing, textStyle } from "../../lib/design";

type Props = {
  title: string;
  subtitle?: string;
  notifyCount?: number;
  showLogo?: boolean;
};

export function LifeTabHeader({ title, subtitle, notifyCount = 0, showLogo = true }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {showLogo ? (
        <View style={styles.logoRow}>
          <SystemLogo width={28} variant="emblem" />
          <View>
            <Text style={[textStyle("footnote", "bold"), { color: colors.text }]}>STOS Life</Text>
            <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>Vì cuộc sống an tâm</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <Text style={[textStyle("title2", "bold"), { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <View style={styles.subRow}>
              {subtitle.includes("An tâm") ? <Ionicons name="shield-checkmark" size={14} color={brand.techCyan} /> : null}
              <Text style={[textStyle("footnote"), { color: colors.textSecondary }]}>{subtitle}</Text>
            </View>
          ) : null}
        </View>
        <Pressable onPress={() => router.push("/community-feed" as never)} style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {notifyCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notifyCount > 9 ? "9+" : notifyCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable onPress={() => router.push("/(tabs)/account")} style={styles.avatar}>
          <Ionicons name="people" size={20} color={brand.navy} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  flex: { flex: 1 },
  subRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  iconBtn: { padding: spacing.xs },
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
});
