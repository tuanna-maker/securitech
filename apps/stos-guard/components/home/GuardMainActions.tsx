import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { GuardGlyph } from "../guard/GuardGlyphs";
import { GUARD_ACTIONS, GUARD_QUEUE } from "../../lib/guardUiConfig";
import { guardActionTile } from "../../lib/guardSurfaces";
import { spacing, textStyle } from "../../lib/design";

export function GuardMainActions({ onDuty, queueCount }: { onDuty: boolean; queueCount: number }) {
  const go = (key: string) => {
    if (key !== "checkin" && key !== "incident" && !onDuty) {
      Alert.alert("Chưa vào ca", "Vui lòng điểm danh trước.", [
        { text: "Vào ca", onPress: () => router.push({ pathname: "/attendance/index", params: { mode: "checkin" } }) },
        { text: "Huỷ", style: "cancel" },
      ]);
      return;
    }
    if (key === "checkin") router.push({ pathname: "/attendance/index", params: { mode: "checkin" } });
    else if (key === "checkout") router.push({ pathname: "/attendance/index", params: { mode: "checkout" } });
    else if (key === "patrol") router.push("/patrol/demo-route");
    else if (key === "incident") router.push("/situation/new");
    else if (key === "queue") router.push("/queue/index");
  };

  return (
    <View>
      <View style={styles.grid}>
        {GUARD_ACTIONS.map((a) => (
          <Pressable key={a.key} onPress={() => go(a.key)} style={({ pressed }) => [styles.tile, guardActionTile(a.bg), pressed && styles.pressed]}>
            <GuardGlyph name={a.glyph} size={36} color="#fff" />
            <Text style={styles.tileTitle}>{a.title}</Text>
            <Text style={styles.tileSub}>{a.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => go("queue")} style={({ pressed }) => [styles.queue, guardActionTile(GUARD_QUEUE.bg), pressed && styles.pressed]}>
        <View style={styles.queueIconWrap}>
          <GuardGlyph name={GUARD_QUEUE.glyph} size={28} color="#fff" />
        </View>
        <View style={styles.queueText}>
          <Text style={styles.queueTitle}>{GUARD_QUEUE.title}</Text>
          <Text style={styles.queueSub}>
            {GUARD_QUEUE.subtitle}
            {queueCount > 0 ? ` · ${queueCount} đang chờ` : ""}
          </Text>
        </View>
        <GuardGlyph name="chevron-right" size={22} color="rgba(255,255,255,0.9)" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12, marginBottom: 12 },
  tile: {
    width: "48%",
    minHeight: 124,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    gap: 4,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  tileTitle: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.4, marginTop: 6, textAlign: "center" },
  tileSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "500" },
  queue: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  queueIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  queueText: { flex: 1 },
  queueTitle: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },
  queueSub: { color: "rgba(255,255,255,0.88)", fontSize: 13, marginTop: 2 },
});
