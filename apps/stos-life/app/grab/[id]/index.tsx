import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Avatar, StatusPulse, subscribeLifeRequestEvents, subscribeRequestUpdates } from "@stos/mobile-shared";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Screen } from "../../../components/ui/Screen";
import { Button } from "../../../components/ui/Button";
import { GradientButton } from "../../../components/ui/GradientButton";
import { GrabStatusCard } from "../../../components/grab/GrabStatusCard";
import { useTheme } from "../../../hooks/useTheme";
import { db, callFunction } from "../../../lib/db";
import { brand } from "../../../lib/brand";
import { textStyle, spacing } from "../../../lib/design";

const LABELS: Record<string, string> = {
  submitted: "Đang tìm anh hỗ trợ…",
  accepted: "Anh đã nhận việc",
  en_route: "Anh đang đến",
  on_site: "Anh đang hỗ trợ bạn",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  expired: "Chưa có anh nhận — thử lại hoặc gọi lễ tân",
};

export default function GrabTrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const qc = useQueryClient();

  const { data: req } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const { data } = await db
        .from("quick_service_requests")
        .select("*, staff_members(name, phone, avatar_url)")
        .eq("id", id)
        .single();
      return data;
    },
  });

  useEffect(() => {
    if (!id) return;
    const bump = () => qc.invalidateQueries({ queryKey: ["request", id] });
    const chReq = subscribeRequestUpdates(db, id, "quick_service_requests", bump);
    const chEv = subscribeLifeRequestEvents(db, id, bump);
    return () => {
      db.removeChannel(chReq);
      db.removeChannel(chEv);
    };
  }, [id, qc]);

  useEffect(() => {
    if (req?.app_status === "completed") router.replace(`/grab/${id}/rate`);
  }, [req?.app_status, id]);

  const cancel = async () => {
    await callFunction("life-handler", { method: "POST", query: { action: "cancel-request" }, body: { request_id: id } });
    router.replace("/(tabs)");
  };

  const status = req?.app_status || "submitted";
  const guard = req?.staff_members as { name?: string; phone?: string; avatar_url?: string } | null;
  const live = ["en_route", "on_site"].includes(status);

  return (
    <Screen title="Theo dõi yêu cầu" subtitle={req?.service_type} largeTitle={false}>
      {live ? (
        <View style={styles.live}>
          <StatusPulse size={72} color={brand.techCyan} />
          {guard?.name ? <Avatar uri={guard.avatar_url} name={guard.name} size="md" /> : null}
        </View>
      ) : null}
      <GrabStatusCard status={status} label={LABELS[status] || status} guardName={guard?.name} />
      {["en_route", "on_site"].includes(status) ? (
        <GradientButton title="Xem bản đồ · theo dõi anh" variant="primary" onPress={() => router.push(`/grab/${id}/map`)} />
      ) : null}
      {["submitted", "accepted"].includes(status) ? (
        <Button title="Hủy yêu cầu" variant="outline" onPress={cancel} style={{ marginTop: spacing.lg }} />
      ) : null}
      {status === "expired" ? (
        <Text style={[textStyle("footnote"), { color: colors.warning, marginTop: spacing.md }]}>
          Yêu cầu hết hạn SLA — thử Grab lại hoặc gọi lễ tân.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  live: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16 },
});
