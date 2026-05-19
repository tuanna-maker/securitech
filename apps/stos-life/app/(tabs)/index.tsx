import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { StosIcon, LIFE_ICON_PRESETS } from "@stos/mobile-shared";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "../../components/ui/Screen";
import { LifeHeader } from "../../components/life/LifeHeader";
import { QuickTileGrid } from "../../components/life/QuickTileGrid";
import { SectionTitle } from "../../components/life/SectionTitle";
import { useAuth } from "../../hooks/useAuth";
import { useLifeRealtime } from "../../hooks/useLifeRealtime";
import { useTheme } from "../../hooks/useTheme";
import { gradients } from "../../lib/brand";
import { db } from "../../lib/db";
import { openHref } from "../../lib/lifeNav";
import { radii, spacing, textStyle } from "../../lib/design";

export default function HomeScreen() {
  const { resident } = useAuth();
  useLifeRealtime("home");
  const { colors } = useTheme();
  const firstName = resident?.full_name?.split(" ").pop() || "bạn";
  const apt = resident?.apartment ? `Căn ${resident.apartment}` : "Căn —";

  const { data: activeReq } = useQuery({
    queryKey: ["active-request", resident?.id],
    enabled: !!resident?.id,
    queryFn: async () => {
      const { data } = await db
        .from("quick_service_requests")
        .select("id, app_status, service_type")
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

  const tiles = [
    { key: "family", label: "Gia đình tôi", ...LIFE_ICON_PRESETS.family, onPress: () => router.push("/(tabs)/family") },
    { key: "security", label: "Dịch vụ bảo an", ...LIFE_ICON_PRESETS.security, onPress: () => router.push("/(tabs)/security") },
    { key: "health", label: "Sức khỏe", ...LIFE_ICON_PRESETS.health, onPress: () => router.push("/(tabs)/health") },
    { key: "guests", label: "Khách & QR", ...LIFE_ICON_PRESETS.guests, onPress: () => openHref("/guests/index") },
    { key: "parcels", label: "Bưu phẩm", ...LIFE_ICON_PRESETS.parcels, onPress: () => openHref("/parcels/index") },
    { key: "farm", label: "Farm Fresh", ...LIFE_ICON_PRESETS.farm, onPress: () => openHref("/farm/index") },
  ];

  return (
    <Screen title="" largeTitle={false} scroll>
      <LifeHeader
        mode="home"
        title={`Xin chào, ${firstName}`}
        subtitle={`${apt} · STOS Life`}
        notifyCount={activeReq ? 1 : 3}
      />

      <Pressable onPress={openGrab} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, marginBottom: spacing.lg }]}>
        <LinearGradient colors={[...gradients.grab]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.grabBanner}>
          <StosIcon name="shield-grab" size={32} color="#fff" />
          <View style={styles.grabText}>
            <Text style={[textStyle("headline", "bold"), styles.white]}>Gọi anh bảo vệ</Text>
            <Text style={[textStyle("caption1"), styles.whiteSub]}>Grab nội khu · Phản hồi nhanh</Text>
          </View>
          <StosIcon name="chevron-right" size={22} color="#fff" />
        </LinearGradient>
      </Pressable>

      <SectionTitle title="TRUY CẬP NHANH" />
      <QuickTileGrid tiles={tiles} columns={3} />

      <Pressable
        onPress={() => router.push("/sos")}
        style={[styles.sos, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}
      >
        <StosIcon name="sos" size={22} color="#DC2626" />
        <Text style={[textStyle("subhead", "semibold"), { color: "#DC2626", flex: 1 }]}>SOS khẩn cấp</Text>
        <StosIcon name="chevron-right" size={20} color="#DC2626" />
      </Pressable>

      <View style={{ height: 108 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grabBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
  },
  grabText: { flex: 1 },
  white: { color: "#fff" },
  whiteSub: { color: "rgba(255,255,255,0.92)", marginTop: 2 },
  sos: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: spacing.lg,
  },
});
