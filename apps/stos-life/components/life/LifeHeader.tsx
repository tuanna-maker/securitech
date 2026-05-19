import { View, Text, Pressable, StyleSheet } from "react-native";
import { StosIcon } from "@stos/mobile-shared";
import { router } from "expo-router";
import { SystemLogo } from "../brand/SystemLogo";
import { useTheme } from "../../hooks/useTheme";
import { brand } from "../../lib/brand";
import { spacing, textStyle } from "../../lib/design";

type Props = {
  mode?: "home" | "centered" | "minimal";
  title?: string;
  subtitle?: string;
  notifyCount?: number;
  showProfileMenu?: boolean;
  onBack?: () => void;
  rightIcons?: ("search" | "calendar")[];
};

export function LifeHeader({
  mode = "home",
  title = "",
  subtitle,
  notifyCount = 3,
  showProfileMenu = false,
  onBack,
  rightIcons,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {mode !== "minimal" ? (
        <View style={styles.logoRow}>
          <SystemLogo width={32} variant="emblem" />
          <View>
            <Text style={[textStyle("subhead", "bold"), { color: brand.navy }]}>STOS Life</Text>
            <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>Vì cuộc sống an tâm</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.mainRow}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
            <StosIcon name="chevron-back" size={26} color={colors.text} />
          </Pressable>
        ) : mode === "centered" ? (
          <View style={styles.sideSpacer} />
        ) : null}

        <View style={[styles.titleBlock, mode === "centered" && styles.titleCentered]}>
          {mode === "home" ? (
            <>
              <Text style={[textStyle("title2", "bold"), { color: colors.text }]}>{title}</Text>
              {subtitle ? <Text style={[textStyle("footnote"), { color: colors.textSecondary, marginTop: 2 }]}>{subtitle}</Text> : null}
            </>
          ) : mode === "centered" ? (
            <>
              <Text style={[textStyle("title3", "bold"), { color: colors.text, textAlign: "center" }]}>{title}</Text>
              {subtitle ? (
                <View style={styles.subCenter}>
                  <StosIcon name="shield-badge" size={13} color={brand.techCyan} />
                  <Text style={[textStyle("caption2"), { color: colors.textSecondary, textAlign: "center", flex: 1 }]}>
                    {subtitle}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <>
              <Text style={[textStyle("title3", "bold"), { color: colors.text }]}>{title}</Text>
              {subtitle ? <Text style={[textStyle("caption1"), { color: colors.textSecondary, marginTop: 2 }]}>{subtitle}</Text> : null}
            </>
          )}
        </View>

        <View style={styles.actions}>
          {rightIcons?.includes("search") ? (
            <Pressable style={styles.iconBtn}>
              <StosIcon name="search" size={22} color={colors.text} />
            </Pressable>
          ) : null}
          {rightIcons?.includes("calendar") ? (
            <Pressable style={styles.iconBtn}>
              <StosIcon name="calendar" size={22} color={colors.text} />
            </Pressable>
          ) : null}
          <Pressable onPress={() => router.push("/community-feed" as never)} style={styles.iconBtn}>
            <StosIcon name="notifications" size={24} color={colors.text} />
            {notifyCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifyCount}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable onPress={() => router.push("/(tabs)/account")} style={styles.profileBtn}>
            <View style={styles.profileInner}>
              <StosIcon name="people" size={18} color={brand.navy} />
            </View>
            {showProfileMenu ? <StosIcon name="chevron-down" size={14} color={colors.textTertiary} /> : null}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  mainRow: { flexDirection: "row", alignItems: "flex-start" },
  sideSpacer: { width: 72 },
  backBtn: { marginRight: spacing.xs, marginTop: 2 },
  titleBlock: { flex: 1, paddingRight: spacing.sm },
  titleCentered: { alignItems: "center" },
  subCenter: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4, paddingHorizontal: spacing.sm },
  actions: { flexDirection: "row", alignItems: "center", gap: 2 },
  iconBtn: { padding: 6 },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  profileBtn: { flexDirection: "row", alignItems: "center", gap: 2, paddingLeft: 4 },
  profileInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
