import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { StosIcon, type StosIconName } from "@stos/mobile-shared";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "../../components/ui/Screen";
import { LifeHeader } from "../../components/life/LifeHeader";
import { SectionTitle } from "../../components/life/SectionTitle";
import { useAuth } from "../../hooks/useAuth";
import { useLifeRealtime } from "../../hooks/useLifeRealtime";
import { useTheme } from "../../hooks/useTheme";
import { brand, gradients } from "../../lib/brand";
import { SECURITY_ACTIVITY, SECURITY_QUICK, SECURITY_SERVICES } from "../../lib/mockLifeData";
import { openLifeFeature, openHref } from "../../lib/lifeNav";
import { db } from "../../lib/db";
import { MockCard } from "../../components/life/MockCard";
import { softCardShadow } from "@stos/mobile-shared";
import { radii, spacing, textStyle } from "../../lib/design";

export default function SecurityScreen() {
  const { resident } = useAuth();
  useLifeRealtime("security");
  const { colors, life, isDark } = useTheme();

  const { data: activeReq } = useQuery({
    queryKey: ["active-request", resident?.id],
    enabled: !!resident?.id,
    queryFn: async () => {
      const { data } = await db
        .from("quick_service_requests")
        .select("id")
        .eq("resident_id", resident!.id)
        .in("app_status", ["submitted", "accepted", "en_route", "on_site"])
        .maybeSingle();
      return data;
    },
  });

  const openGrab = () => {
    if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (activeReq) router.push(`/grab/${activeReq.id}`);
    else router.push("/grab/select");
  };

  const onQuick = (action: string) => {
    if (action === "grab") openGrab();
    else if (action === "incident") router.push("/incidents/new");
    else if (action === "guests") openHref("/guests/index");
    else if (action === "status") openLifeFeature("Tình hình an ninh chi tiết");
    else if (action === "unlock") openLifeFeature("Mở khóa từ xa");
  };

  return (
    <Screen title="" largeTitle={false} scroll>
      <LifeHeader
        mode="centered"
        title="Dịch vụ bảo an"
        subtitle="An tâm từng khoảnh khắc – Bảo vệ những người bạn yêu thương"
        notifyCount={3}
        showProfileMenu
      />

      <LinearGradient
        colors={isDark ? ["#1e3a8a", "#0f172a"] : ["#1e3a8a", "#2563eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.secHero}
      >
        <View style={styles.shBadge}>
          <Text style={styles.shBadgeText}>🛡️ Bảo vệ gia đình bạn</Text>
        </View>
        <Text style={styles.shTitle}>24/7</Text>
        <Text style={styles.shSub}>
          Đội ngũ chuyên nghiệp - Công nghệ hiện đại{"\n"}Luôn sẵn sàng hỗ trợ
        </Text>
        <View style={styles.shTags}>
          <Text style={styles.shTag}>✓ An toàn</Text>
          <Text style={styles.shTag}>⚡ Nhanh chóng</Text>
          <Text style={styles.shTag}>♡ Tin cậy</Text>
        </View>
        <View style={styles.shShieldArt}>
          <StosIcon name="shield-grab" size={72} color="rgba(96,165,250,0.85)" />
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
        {SECURITY_QUICK.map((q) => (
          <View key={q.label} style={styles.quickCol}>
            <Pressable onPress={() => onQuick(q.action)}>
              <View style={[styles.quickCircle, { backgroundColor: q.bg, borderColor: colors.border }, softCardShadow(isDark)]}>
                <StosIcon name={q.icon} size={26} color={q.color} variant="filled" />
              </View>
            </Pressable>
            <Text style={[textStyle("caption1", "semibold"), { color: colors.text, textAlign: "center" }]} numberOfLines={2}>
              {q.label.replace("\n", " ")}
            </Text>
            <Text style={[textStyle("caption2"), { color: colors.textTertiary, textAlign: "center" }]}>{q.sub}</Text>
          </View>
        ))}
      </ScrollView>

      <SectionTitle title="TÌNH HÌNH AN NINH" link="Xem chi tiết >" onLink={() => openLifeFeature("Chi tiết an ninh")} />
      <View style={[styles.safeBanner, { backgroundColor: life.greenPillBg, borderColor: "rgba(39,174,96,0.2)" }]}>
        <Text style={{ fontSize: 24 }}>🛡️</Text>
        <View style={styles.flex}>
          <Text style={[textStyle("subhead", "bold"), { color: life.success }]}>Khu vực của bạn đang an toàn</Text>
          <Text style={[textStyle("caption2"), { color: life.textSub }]}>Không có cảnh báo an ninh trong 24 giờ qua</Text>
        </View>
        <View style={[styles.safePill, { backgroundColor: life.greenPillBg }]}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: life.success }}>An toàn</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: "Camera hoạt động", val: "128", icon: "videocam" as StosIconName, bg: "#DBEAFE", c: "#2563EB" },
          { label: "Nhân viên trực", val: "24/24", icon: "people" as StosIconName, bg: "#D1FAE5", c: "#059669" },
          { label: "Sự cố đã xử lý", val: "0", icon: "tab-shield" as StosIconName, bg: "#EDE9FE", c: "#7C3AED" },
          { label: "Phản hồi TB", val: "2 phút", icon: "time" as StosIconName, bg: "#FFEDD5", c: "#EA580C" },
        ].map((s) => (
          <MockCard key={s.label} style={styles.statCard} radius={12} padded>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <StosIcon name={s.icon} size={16} color={s.c} />
            </View>
            <Text style={[textStyle("caption2"), { color: colors.textTertiary, textAlign: "center" }]} numberOfLines={2}>
              {s.label}
            </Text>
            <Text style={[textStyle("subhead", "bold"), { color: colors.text }]}>{s.val}</Text>
          </MockCard>
        ))}
      </View>

      <SectionTitle title="DỊCH VỤ NỔI BẬT" link="Tất cả dịch vụ >" onLink={openGrab} />
      <View style={styles.svcGrid}>
        {SECURITY_SERVICES.map((s) => (
          <MockCard key={s.title} style={styles.svcCard} radius={16} onPress={() => openHref(s.href)}>
            <View style={[styles.svcIcon, { backgroundColor: s.bg }]}>
              <StosIcon name={s.icon} size={22} color={s.color} />
            </View>
            <Text style={[textStyle("subhead", "semibold"), { color: colors.text, paddingRight: 20 }]}>{s.title}</Text>
            <Text style={[textStyle("caption2"), { color: colors.textSecondary }]} numberOfLines={2}>
              {s.desc}
            </Text>
            <View style={styles.svcArrow}>
              <StosIcon name="chevron-right" size={16} color={colors.textTertiary} />
            </View>
          </MockCard>
        ))}
      </View>

      <SectionTitle title="HOẠT ĐỘNG GẦN ĐÂY" link="Xem tất cả >" onLink={() => openLifeFeature("Nhật ký hoạt động an ninh")} />
      {SECURITY_ACTIVITY.map((a) => (
        <Pressable key={a.title} style={[styles.actRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.actIcon, { backgroundColor: a.color + "20" }]}>
            <StosIcon name={a.icon} size={20} color={a.color} />
          </View>
          <View style={styles.flex}>
            <Text style={[textStyle("subhead", "semibold"), { color: colors.text }]}>{a.title}</Text>
            <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>{a.sub}</Text>
          </View>
          <StosIcon name="chevron-right" size={18} color={colors.textTertiary} />
        </Pressable>
      ))}

      <Pressable onPress={openGrab} style={{ marginTop: spacing.md }}>
        <LinearGradient colors={[...gradients.grab]} style={styles.bottomCta}>
          <StosIcon name="call" size={22} color="#fff" />
          <Text style={[textStyle("headline", "bold"), { color: "#fff" }]}>Gọi anh bảo vệ ngay</Text>
        </LinearGradient>
      </Pressable>

      <View style={{ height: 108 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  secHero: {
    borderRadius: 24,
    padding: 20,
    marginBottom: spacing.lg,
    overflow: "hidden",
    minHeight: 160,
  },
  shBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  shBadgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  shTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 8 },
  shSub: { fontSize: 12, color: "#cbd5e1", lineHeight: 18, maxWidth: "70%" },
  shTags: { flexDirection: "row", gap: 12, marginTop: 16 },
  shTag: { fontSize: 11, fontWeight: "600", color: "#60a5fa" },
  shShieldArt: { position: "absolute", right: -8, bottom: -10, opacity: 0.85 },
  quickRow: { gap: 16, paddingBottom: spacing.md },
  quickCol: { width: 76, alignItems: "center", gap: 4 },
  quickCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  safeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  flex: { flex: 1 },
  safePill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: spacing.sm },
  statCard: { flex: 1, alignItems: "center", gap: 4 },
  statIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  svcGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  svcCard: { width: "48.2%", minHeight: 118, position: "relative" },
  svcIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  svcArrow: { position: "absolute", top: 14, right: 12 },
  actRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  actIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bottomCta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: spacing.lg, borderRadius: 16 },
});
