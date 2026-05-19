import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { GuardGlyph } from "../../components/guard/GuardGlyphs";
import { Screen } from "../../components/ui/Screen";
import { GuardScreenHeader } from "../../components/guard/GuardScreenHeader";
import { useAuth } from "../../hooks/useAuth";
import { guardActionTile, guardCard, guardPalette } from "../../lib/guardSurfaces";
import { spacing, textStyle } from "../../lib/design";
import { callFunction } from "../../lib/db";

const CHECKLIST = [
  "Không còn sự cố chờ xử lý",
  "Đã bàn giao chìa khóa / bộ đàm",
  "Đã hoàn thành tuần tra tuyến",
  "Không còn yêu cầu cư dân chờ",
];

export default function AttendanceScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isCheckout = mode === "checkout";
  const { staff, setOnDuty } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState("Đang lấy vị trí…");
  const [locOk, setLocOk] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [checks, setChecks] = useState([true, true, true, true]);

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setAddress("Cần quyền vị trí để điểm danh");
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const rev = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        const line = rev[0];
        setAddress(
          line
            ? [line.name, line.street, line.district].filter(Boolean).join(", ") ||
              "Sảnh chính — Tòa A · STOS Residence"
            : "Sảnh chính — Tòa A · STOS Residence"
        );
        setLocOk(true);
      } catch {
        setAddress("Sảnh chính — Tòa A · STOS Residence");
        setLocOk(true);
      }
    })();
  }, []);

  const accent = isCheckout ? "#FF3B30" : "#34C759";
  const timeStr = clock.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = clock.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Cần quyền vị trí");
      const loc = await Location.getCurrentPositionAsync({});
      if (!isCheckout) {
        await callFunction("guard-handler", {
          method: "POST",
          query: { action: "attendance" },
          body: {
            staff_id: staff?.id,
            building_id: staff?.building_id,
            type: "check_in",
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          },
        });
        setOnDuty(true);
      } else {
        setOnDuty(false);
      }
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi điểm danh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="" largeTitle={false} scroll>
      <GuardScreenHeader
        title={isCheckout ? "KẾT THÚC CA (CHECK-OUT)" : "VÀO CA (CHECK-IN)"}
        showBack
      />

      <View style={[styles.mapCard, guardCard()]}>
        <View style={[styles.mapRing, { borderColor: accent + "55" }]}>
          <View style={[styles.mapInner, { backgroundColor: guardPalette.elevated }]}>
            <GuardGlyph name="pin" size={44} color={accent} />
          </View>
        </View>
        <Text style={[textStyle("footnote", "semibold"), { color: locOk ? accent : "#FF9500", marginTop: spacing.md }]}>
          {locOk ? "✓ Lấy vị trí thành công" : "Đang lấy vị trí…"}
        </Text>
        <Text style={[textStyle("caption1"), { color: "#94A3B8", textAlign: "center", marginTop: 6, paddingHorizontal: spacing.md }]}>
          {address}
        </Text>
      </View>

      <Text style={[textStyle("caption1"), { color: "#94A3B8", textAlign: "center", marginBottom: 6 }]}>Thời gian hiện tại</Text>
      <View style={styles.clockRow}>
        <GuardGlyph name="clock" size={22} color={accent} />
        <Text style={[styles.clockBig, { color: accent }]}>{timeStr}</Text>
      </View>
      <Text style={[textStyle("footnote"), { color: "#64748B", textAlign: "center", marginBottom: spacing.lg }]}>{dateStr}</Text>

      {isCheckout ? (
        <View style={[styles.checklist, guardCard()]}>
          <Text style={[textStyle("subhead", "semibold"), { color: "#fff", marginBottom: spacing.md }]}>Xác nhận kết thúc ca</Text>
          {CHECKLIST.map((label, i) => (
            <Pressable key={label} onPress={() => setChecks((p) => p.map((v, idx) => (idx === i ? !v : v)))} style={styles.checkRow}>
              <GuardGlyph name={checks[i] ? "check-square" : "circle-empty"} size={24} color={checks[i] ? "#34C759" : "#64748B"} />
              <Text style={[textStyle("footnote"), { color: "#E2E8F0", flex: 1 }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={[styles.infoBox, { borderColor: "rgba(0,122,255,0.45)", backgroundColor: "rgba(0,122,255,0.12)" }]}>
          <GuardGlyph name="info" size={22} color="#007AFF" />
          <Text style={[textStyle("footnote"), { color: "#CBD5E1", flex: 1 }]}>
            Vui lòng đứng đúng vị trí làm việc (trong bán kính 50m) trước khi xác nhận vào ca.
          </Text>
        </View>
      )}

      {error ? <Text style={[textStyle("footnote"), { color: "#FF3B30", marginTop: spacing.md }]}>{error}</Text> : null}

      <Pressable onPress={submit} disabled={loading} style={[styles.ctaWrap, guardActionTile(accent)]}>
        <Text style={styles.ctaText}>
          {loading ? "ĐANG XỬ LÝ…" : isCheckout ? "XÁC NHẬN KẾT THÚC CA" : "XÁC NHẬN VÀO CA"}
        </Text>
      </Pressable>
      <View style={{ height: 40 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapCard: { alignItems: "center", padding: spacing.xl, marginBottom: spacing.lg },
  mapRing: { width: 148, height: 148, borderRadius: 74, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  mapInner: { width: 128, height: 128, borderRadius: 64, alignItems: "center", justifyContent: "center" },
  clockRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  clockBig: { fontSize: 36, fontWeight: "700", fontVariant: ["tabular-nums"] },
  infoBox: { flexDirection: "row", gap: spacing.md, padding: spacing.md, borderRadius: 14, borderWidth: 1, alignItems: "flex-start", marginBottom: spacing.md },
  checklist: { padding: spacing.lg, gap: spacing.md, marginBottom: spacing.md },
  checkRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  ctaWrap: { marginTop: spacing.lg, paddingVertical: 18, alignItems: "center", borderRadius: 18 },
  ctaText: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 0.5 },
});
