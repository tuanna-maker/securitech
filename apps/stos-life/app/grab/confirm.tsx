import { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../components/ui/Screen";
import { Input } from "../../components/ui/Input";
import { GradientButton } from "../../components/ui/GradientButton";
import { GrabFlowHeader } from "../../components/grab/GrabFlowHeader";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { db, functionsUrl } from "../../lib/db";
import { getGrabServiceMeta } from "../../lib/grabServices";
import { brand } from "../../lib/brand";
import { cardShadow, radii, spacing, textStyle } from "../../lib/design";

export default function GrabConfirmScreen() {
  const { service_type } = useLocalSearchParams<{ service_type: string }>();
  const { resident } = useAuth();
  const { colors, isDark } = useTheme();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const meta = useMemo(() => getGrabServiceMeta(String(service_type || "")), [service_type]);
  const label =
    [
      { code: "open_door", label: "Mở cửa" },
      { code: "receive_parcel", label: "Nhận hộ" },
      { code: "carry_items", label: "Xách đồ" },
      { code: "urgent_assist", label: "Hỗ trợ khẩn" },
    ].find((x) => x.code === service_type)?.label ?? service_type;

  const submit = async () => {
    if (!resident) return;
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await db.auth.getSession();
      const res = await fetch(`${functionsUrl}/service-handler?type=quick`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify({
          building_id: resident.building_id,
          resident_id: resident.id,
          service_type,
          description: note || null,
          priority_tier: service_type === "urgent_assist" ? "high" : "normal",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gửi thất bại");
      const row = json.data ?? json;
      router.replace(`/grab/${row.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="" scroll largeTitle={false}>
      <GrabFlowHeader
        title="Xác nhận yêu cầu"
        subtitle="Kiểm tra lại trước khi gửi cho anh bảo vệ"
        icon="checkmark-circle"
        accent="primary"
      />

      <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }, cardShadow(isDark)]}>
        <View style={[styles.iconWrap, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={26} color={meta.iconColor} />
        </View>
        <View style={styles.summaryText}>
          <Text style={[textStyle("headline", "semibold"), { color: colors.text }]}>{label}</Text>
          <Text style={[textStyle("footnote"), { color: colors.textSecondary, marginTop: 4 }]}>
            Căn {resident?.apartment}
            {resident?.buildings?.name ? ` · ${resident.buildings.name}` : ""}
          </Text>
        </View>
      </View>

      <Input label="Ghi chú (tuỳ chọn)" value={note} onChangeText={setNote} multiline placeholder="VD: Cổng B, mang thêm túi…" />
      {error ? (
        <Text style={[textStyle("footnote"), { color: brand.error, marginTop: spacing.sm }]}>{error}</Text>
      ) : null}
      <GradientButton title="Gửi yêu cầu ngay" variant="grab" onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryText: { flex: 1 },
});
