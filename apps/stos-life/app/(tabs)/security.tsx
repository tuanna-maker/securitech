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
  const { colors, isDark } = useTheme();

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

      <LinearGradient colors={["#EFF6FF", "#DBEAFE", "#E0E7FF"]} style={styles.hero}>
        <View style={styles.heroInner}>
          <View style={[styles.heroShield, { backgroundColor: brand.navy }]}>
            <StosIcon name="shield-grab" size={36} color="#fff" />
          </View>
          <View style={styles.heroCenter}>
            <Text style={[textStyle("subhead", "semibold"), { color: brand.navy }]}>Bảo vệ gia đình bạn</Text>
            <Text style={[textStyle("largeTitle", "bold"), { color: brand.navy, fontSize: 32 }]}>24/7</Text>
            <Text style={[textStyle("caption1"), { color: "#475569", marginTop: 4 }]}>
              Đội ngũ chuyên nghiệp – Công nghệ hiện đại.{"\n"}Luôn sẵn sàng hỗ trợ
            </Text>
            <View style={styles.heroTags}>
              {[
                { icon: "check-circle" as StosIconName, label: "An toàn", c: "#16A34A" },
                { icon: "lightning" as StosIconName, label: "Nhanh chóng", c: "#2563EB" },
                { icon: "heart" as StosIconName, label: "Tin cậy", c: "#7C3AED" },
              ].map((t) => (
                <View key={t.label} style={styles.tag}>
                  <StosIcon name={t.icon} size={13} color={t.c} />
                  <Text style={[textStyle("caption2"), { color: "#64748B" }]}>{t.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.heroPhoto}>
            <StosIcon name="people" size={48} color={brand.navy} />
          </View>
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
      <MockCard style={[styles.safeBanner, { backgroundColor: isDark ? "rgba(34, 197, 94, 0.12)" : "#DCFCE7" }]}>
        <StosIcon name="shield-badge" size={32} color="#16A34A" />
        <View style={styles.flex}>
          <Text style={[textStyle("subhead", "semibold"), { color: "#14532D" }]}>Khu vực của bạn đang an toàn</Text>
          <Text style={[textStyle("caption2"), { color: "#166534" }]}>Không có cảnh báo an ninh trong 24 giờ qua</Text>
        </View>
        <View style={styles.safePill}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#16A34A" }}>An toàn</Text>
        </View>
      </MockCard>

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
  hero: { borderRadius: 20, padding: spacing.lg, marginBottom: spacing.lg },
  heroInner: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  heroShield: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  heroCenter: { flex: 1 },
  heroTags: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 10 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroPhoto: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
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
  },
  flex: { flex: 1 },
  safePill: { backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.pill },
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
