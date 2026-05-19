import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { uploadImageFromUri } from "@stos/mobile-shared";
import { GuardGlyph } from "../../components/guard/GuardGlyphs";
import { Screen } from "../../components/ui/Screen";
import { GuardScreenHeader } from "../../components/guard/GuardScreenHeader";
import { useHaptics } from "../../hooks/useHaptics";
import { PATROL_CHECKPOINTS } from "../../lib/mockGuardData";
import { guardActionTile, guardCard } from "../../lib/guardSurfaces";
import { callFunction, db } from "../../lib/db";
import { spacing, textStyle } from "../../lib/design";

export default function PatrolRouteScreen() {
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const haptics = useHaptics();
  const [points, setPoints] = useState(PATROL_CHECKPOINTS);
  const [photos, setPhotos] = useState<Record<number, string>>({});

  const total = points.length;
  const completed = points.filter((p) => p.done).length;
  const pct = Math.round((completed / total) * 100);
  const nextIdx = points.findIndex((p) => !p.done);

  const tick = async (i: number) => {
    haptics.success();
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    setPoints((prev) => prev.map((p, idx) => (idx === i ? { ...p, done: true, time: now } : p)));
    try {
      const ImagePicker = await import("expo-image-picker");
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      const shot = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (shot.canceled || !shot.assets[0]) return;
      const url = await uploadImageFromUri(db, {
        bucket: "incident-attachments",
        path: `patrol/${routeId}/${i}-${Date.now()}.jpg`,
        uri: shot.assets[0].uri,
      });
      setPhotos((p) => ({ ...p, [i]: url }));
    } catch {
      Alert.alert("Expo Go", "Chụp ảnh cần development build.");
    }
  };

  return (
    <Screen title="" largeTitle={false} scroll>
      <GuardScreenHeader title="TUẦN TRA" subtitle="Ca sáng: 06:00 – 14:00" showBack />

      <View style={[styles.progressCard, guardCard()]}>
        <View style={styles.progressTop}>
          <Text style={[textStyle("subhead", "semibold"), { color: "#fff" }]}>Tiến độ tuần tra</Text>
          <Text style={[textStyle("subhead", "bold"), { color: "#34C759" }]}>
            {completed}/{total} điểm · {pct}%
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>

      {points.map((p, i) => (
        <View key={p.name} style={[styles.row, guardCard()]}>
          <GuardGlyph
            name={p.done ? "check-square" : "circle-empty"}
            size={28}
            color={p.done ? "#34C759" : "#fff"}
          />
          <View style={styles.rowBody}>
            <Text style={[textStyle("subhead", "semibold"), { color: "#fff" }]}>{p.name}</Text>
            <Text style={[textStyle("caption1", "semibold"), { color: p.done ? "#34C759" : "#FF9500" }]}>
              {p.done ? `Đã điểm danh${p.time ? ` · ${p.time}` : ""}` : "Chưa điểm danh"}
            </Text>
          </View>
          {p.done ? <GuardGlyph name="camera" size={20} color="#64748B" /> : null}
        </View>
      ))}

      {Object.keys(photos).length > 0 ? (
        <ScrollView horizontal style={styles.thumbs} showsHorizontalScrollIndicator={false}>
          {Object.entries(photos).map(([idx, uri]) => (
            <Image key={idx} source={{ uri }} style={styles.thumb} />
          ))}
        </ScrollView>
      ) : null}

      <Pressable onPress={() => tick(nextIdx >= 0 ? nextIdx : 0)} style={[styles.scanBtn, guardActionTile("#007AFF")]}>
        <GuardGlyph name="qr" size={28} color="#fff" />
        <Text style={styles.scanText}>QUÉT QR / CHECK ĐIỂM</Text>
      </Pressable>

      {completed === total ? (
        <Pressable
          onPress={async () => {
            await callFunction("patrol-handler", {
              method: "POST",
              query: { action: "complete-route" },
              body: { route_id: routeId, checkpoints_completed: completed, photos },
            });
            router.back();
          }}
          style={{ marginTop: spacing.md }}
        >
          <Text style={[textStyle("subhead", "semibold"), { color: "#007AFF", textAlign: "center" }]}>Hoàn thành tuyến</Text>
        </Pressable>
      ) : null}
      <View style={{ height: 80 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressCard: { padding: spacing.lg, marginBottom: spacing.lg },
  progressTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  track: { height: 8, borderRadius: 4, backgroundColor: "#252D3A", overflow: "hidden" },
  fill: { height: "100%", backgroundColor: "#34C759", borderRadius: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, marginBottom: spacing.sm },
  rowBody: { flex: 1 },
  thumbs: { marginVertical: spacing.md },
  thumb: { width: 72, height: 72, borderRadius: 10, marginRight: spacing.sm },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: 18,
    marginTop: spacing.lg,
  },
  scanText: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },
});
