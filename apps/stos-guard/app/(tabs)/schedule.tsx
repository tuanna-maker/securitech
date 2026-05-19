import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { GuardGlyph } from "../../components/guard/GuardGlyphs";
import { Screen } from "../../components/ui/Screen";
import { GuardScreenHeader } from "../../components/guard/GuardScreenHeader";
import { useAuth } from "../../hooks/useAuth";
import { DEMO_SCHEDULE } from "../../lib/mockGuardData";
import { guardCard } from "../../lib/guardSurfaces";
import { spacing, textStyle } from "../../lib/design";
import { db } from "../../lib/db";

export default function ScheduleScreen() {
  const { staff } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const [weekOffset] = useState(0);

  const { data: dbRows } = useQuery({
    queryKey: ["shifts", staff?.id],
    enabled: !!staff?.id,
    queryFn: async () => {
      const { data: rows } = await db
        .from("shift_schedules")
        .select("*")
        .eq("staff_member_id", staff!.id)
        .order("shift_date", { ascending: true })
        .limit(14);
      return rows || [];
    },
  });

  const rows = dbRows?.length ? dbRows : DEMO_SCHEDULE;

  const rangeLabel = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + weekOffset * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    return `${fmt(start)} – ${fmt(end)}/${end.getFullYear()}`;
  }, [weekOffset]);

  return (
    <Screen title="" largeTitle={false} scroll>
      <GuardScreenHeader title="LỊCH TRỰC" />

      <View style={[styles.weekNav, guardCard()]}>
        <GuardGlyph name="chevron-back" size={18} color="#94A3B8" />
        <Text style={[textStyle("subhead", "semibold"), { color: "#fff", flex: 1, textAlign: "center" }]}>{rangeLabel}</Text>
        <GuardGlyph name="chevron-right" size={18} color="#94A3B8" />
      </View>

      {rows.map((s) => {
        const status = "status" in s ? s.status : undefined;
        const isToday = s.shift_date === today || status === "today";
        const isOff = status === "off" || s.shift_type === "NGHỈ";
        const upcoming = status === "upcoming" || (!isToday && !isOff && s.shift_date > today);

        return (
          <View
            key={s.id}
            style={[
              styles.card,
              guardCard(),
              isToday && { borderColor: "#007AFF", borderWidth: 2 },
              upcoming && !isToday && { borderColor: "rgba(88,86,214,0.5)" },
            ]}
          >
            <View style={styles.cardTop}>
              <Text style={[textStyle("headline", "semibold"), { color: "#fff" }]}>
                {new Date(s.shift_date).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" })}
              </Text>
              {isToday ? (
                <View style={[styles.badge, { backgroundColor: "#007AFF" }]}>
                  <Text style={styles.badgeText}>Hôm nay</Text>
                </View>
              ) : upcoming ? (
                <View style={[styles.badge, { backgroundColor: "#5856D6" }]}>
                  <Text style={styles.badgeText}>Sắp tới</Text>
                </View>
              ) : null}
            </View>
            {isOff ? (
              <Text style={[textStyle("title2", "bold"), { color: "#64748B", marginTop: spacing.md }]}>NGHỈ</Text>
            ) : (
              <>
                <Text style={[textStyle("subhead", "semibold"), { color: "#E2E8F0", marginTop: spacing.sm }]}>
                  {s.shift_type} · {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}
                </Text>
                {s.location ? <Text style={[textStyle("footnote"), { color: "#94A3B8", marginTop: 4 }]}>{s.location}</Text> : null}
                {"handover" in s && s.handover ? (
                  <Text style={[textStyle("caption1"), { color: "#007AFF", marginTop: 6 }]}>{s.handover}</Text>
                ) : null}
              </>
            )}
          </View>
        );
      })}
      <View style={{ height: 100 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  card: { padding: spacing.lg, marginBottom: spacing.md },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
