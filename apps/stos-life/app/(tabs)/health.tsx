import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { StosIcon, type StosIconName } from "@stos/mobile-shared";
import { Screen } from "../../components/ui/Screen";
import { LifeHeader } from "../../components/life/LifeHeader";
import { SectionTitle } from "../../components/life/SectionTitle";
import { useTheme } from "../../hooks/useTheme";
import { brand } from "../../lib/brand";
import { HEALTH_MEMBERS, HEALTH_METRICS, HEALTH_QUICK } from "../../lib/mockLifeData";
import { openLifeFeature } from "../../lib/lifeNav";
import { MockCard } from "../../components/life/MockCard";
import { IconChip } from "../../components/life/IconChip";
import { radii, spacing, textStyle } from "../../lib/design";

const APPOINTMENTS = [
  { title: "Khám tổng quát định kỳ", who: "Anh Hùng", time: "09:00 · Thứ 6, 24/05", place: "Bệnh viện Vinmec" },
  { title: "Khám răng định kỳ", who: "Chị Lan", time: "14:30 · Thứ 7, 25/05", place: "Nha khoa Parkway" },
];

const MEDS = [
  { who: "Bé Minh", drug: "Vitamin D3 · 1 viên", when: "08:00 · còn 30 phút", color: "#7C3AED" },
  { who: "Bé An", drug: "Siro ho · 5ml", when: "20:00 · còn 11 giờ", color: "#22C55E" },
  { who: "Anh Hùng", drug: "Omega 3 · 1 viên", when: "20:00 · còn 11 giờ", color: "#2563EB" },
];

const RECORDS: { label: string; sub: string; icon: StosIconName; bg: string }[] = [
  { label: "Kết quả xét nghiệm", sub: "12 kết quả", icon: "flask", bg: "#DBEAFE" },
  { label: "Đơn thuốc", sub: "8 đơn", icon: "document", bg: "#EDE9FE" },
  { label: "Tiêm chủng", sub: "Đầy đủ", icon: "vaccine", bg: "#D1FAE5" },
  { label: "Dị ứng", sub: "2 dị ứng", icon: "allergy", bg: "#FFEDD5" },
  { label: "Bệnh sử", sub: "Không bệnh nền", icon: "heart", bg: "#FCE7F3" },
];

const ACTIVITY = [
  { text: "Bé Minh đã hoàn thành mục tiêu 8.000 bước", time: "08:35" },
  { text: "Bạn có lịch khám 'Khám tổng quát định kỳ' vào 24/05", time: "Hôm qua" },
];

export default function HealthScreen() {
  const { colors, isDark } = useTheme();
  const [member, setMember] = useState("all");

  return (
    <Screen title="" largeTitle={false} scroll>
      <LifeHeader
        mode="centered"
        title="Sức khỏe gia đình"
        subtitle="Chăm sóc sức khỏe – An tâm mỗi ngày"
        notifyCount={3}
        showProfileMenu
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.members}>
        {HEALTH_MEMBERS.map((m) => (
          <Pressable key={m.id} onPress={() => setMember(m.id)} style={styles.memberCol}>
            <View style={[styles.memberRing, member === m.id && styles.memberActive, { borderColor: member === m.id ? brand.navy : colors.border }]}>
              <StosIcon name={m.id === "all" ? "people" : "person"} size={24} color={brand.navy} />
              {member === m.id ? (
                <View style={styles.check}>
                  <StosIcon name="check-on" size={9} color="#fff" />
                </View>
              ) : (
                <View style={[styles.statusDot, { backgroundColor: "#22C55E" }]} />
              )}
            </View>
            <Text style={[textStyle("caption2"), { color: colors.text, marginTop: 4 }]}>{m.name}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.memberCol} onPress={() => openLifeFeature("Thêm thành viên")}>
          <View style={[styles.memberRing, { borderColor: colors.border, borderStyle: "dashed" }]}>
            <StosIcon name="add-person" size={24} color={colors.textTertiary} />
          </View>
          <Text style={[textStyle("caption2"), { color: colors.textTertiary, marginTop: 4 }]}>Thêm người</Text>
        </Pressable>
      </ScrollView>

      <MockCard style={{ marginBottom: spacing.md }}>
        <View style={styles.statusHeader}>
          <View>
            <Text style={[textStyle("footnote"), { color: colors.textSecondary }]}>Tình trạng sức khỏe tổng quan</Text>
            <Text style={[textStyle("title2", "bold"), { color: "#16A34A", marginTop: 2 }]}>Tốt</Text>
            <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>Cập nhật 09:30, 20/05/2024</Text>
          </View>
          <StosIcon name="people" size={56} color={brand.navy + "33"} />
        </View>
        <View style={styles.metrics}>
          {HEALTH_METRICS.map((m) => (
            <View key={m.label} style={[styles.metricBox, { backgroundColor: colors.background }]}>
              <StosIcon name={m.icon} size={18} color={m.color} />
              <Text style={[textStyle("caption1", "bold"), { color: colors.text }]}>{m.value}</Text>
              <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>{m.label}</Text>
              <Text style={[textStyle("caption2"), { color: "#16A34A" }]}>{m.status}</Text>
            </View>
          ))}
        </View>
      </MockCard>

      <SectionTitle title="THAO TÁC NHANH" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        {HEALTH_QUICK.map((q) => (
          <IconChip
            key={q.label}
            name={q.icon}
            label={q.label}
            bg={q.bg}
            color={q.color}
            size={54}
            onPress={() => openLifeFeature(q.label, "Sức khỏe")}
          />
        ))}
      </ScrollView>

      <View style={styles.twoCol}>
        <MockCard style={styles.colCard} radius={16}>
          <View style={styles.colHead}>
            <Text style={[textStyle("caption1", "semibold"), { color: colors.text }]}>Lịch khám sắp tới</Text>
            <Pressable onPress={() => openLifeFeature("Lịch khám")}>
              <Text style={[textStyle("caption2"), { color: brand.navyLight }]}>Xem tất cả</Text>
            </Pressable>
          </View>
          {APPOINTMENTS.map((a) => (
            <View key={a.title} style={[styles.appt, { borderBottomColor: colors.border }]}>
              <Text style={[textStyle("caption1", "semibold"), { color: colors.text }]} numberOfLines={2}>
                {a.title}
              </Text>
              <Text style={[textStyle("caption2"), { color: brand.navy, marginTop: 4 }]}>{a.who}</Text>
              <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>{a.time}</Text>
              <Text style={[textStyle("caption2"), { color: colors.textSecondary }]} numberOfLines={1}>
                {a.place}
              </Text>
            </View>
          ))}
        </MockCard>

        <MockCard style={styles.colCard} radius={16}>
          <View style={styles.colHead}>
            <Text style={[textStyle("caption1", "semibold"), { color: colors.text }]}>Nhắc uống thuốc</Text>
            <Pressable onPress={() => openLifeFeature("Nhắc uống thuốc")}>
              <Text style={[textStyle("caption2"), { color: brand.navyLight }]}>Xem tất cả</Text>
            </Pressable>
          </View>
          {MEDS.map((m) => (
            <View key={m.who + m.drug} style={[styles.appt, { borderBottomColor: colors.border }]}>
              <View style={styles.medRow}>
                <View style={[styles.medAvatar, { backgroundColor: m.color + "22" }]}>
                  <StosIcon name="person" size={14} color={m.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[textStyle("caption1", "semibold"), { color: colors.text }]}>{m.who}</Text>
                  <Text style={[textStyle("caption2"), { color: colors.textSecondary }]}>{m.drug}</Text>
                  <Text style={[textStyle("caption2"), { color: m.color }]}>{m.when}</Text>
                </View>
              </View>
            </View>
          ))}
        </MockCard>
      </View>

      <View
        style={[
          styles.aiCard,
          {
            backgroundColor: isDark ? "rgba(124, 58, 237, 0.12)" : colors.card,
            borderColor: isDark ? "rgba(167, 139, 250, 0.45)" : "#C4B5FD",
          },
        ]}
      >
        <View style={styles.aiIcon}>
          <StosIcon name="sparkles" size={20} color="#fff" />
        </View>
        <View style={styles.flex}>
          <View style={styles.aiHead}>
            <Text style={[textStyle("subhead", "bold"), { color: colors.text }]}>AI Health Insight</Text>
            <Pressable onPress={() => openLifeFeature("AI Health Insight")}>
              <Text style={[textStyle("caption2"), { color: "#7C3AED" }]}>Xem chi tiết</Text>
            </Pressable>
          </View>
          <Text style={[textStyle("caption2"), { color: colors.textSecondary, marginTop: 6 }]}>
            · Anh Hùng nên duy trì thói quen đi bộ 30 phút/ngày.{"\n"}· Chị Lan ngủ chưa đủ — nên đi ngủ sớm hơn 30 phút.{"\n"}·
            Gia đình đã tiêm đủ mũi nhắc trong năm nay.
          </Text>
        </View>
      </View>

      <SectionTitle title="HỒ SƠ SỨC KHỎE" link="Xem tất cả" onLink={() => openLifeFeature("Hồ sơ sức khỏe")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        {RECORDS.map((r) => (
          <MockCard key={r.label} radius={16} style={styles.recordCard} onPress={() => openLifeFeature(r.label)}>
            <View style={[styles.recordIcon, { backgroundColor: r.bg }]}>
              <StosIcon name={r.icon} size={22} color={brand.navy} variant="filled" />
            </View>
            <Text style={[textStyle("caption1", "semibold"), { color: colors.text, textAlign: "center" }]} numberOfLines={2}>
              {r.label}
            </Text>
            <Text style={[textStyle("caption2"), { color: colors.textTertiary, textAlign: "center" }]}>{r.sub}</Text>
          </MockCard>
        ))}
      </ScrollView>

      <SectionTitle title="HOẠT ĐỘNG GẦN ĐÂY" link="Xem tất cả" onLink={() => openLifeFeature("Hoạt động sức khỏe")} />
      {ACTIVITY.map((a) => (
        <View key={a.text} style={[styles.actRow, { borderBottomColor: colors.border }]}>
          <Text style={[textStyle("footnote"), { color: colors.text, flex: 1 }]}>{a.text}</Text>
          <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>{a.time}</Text>
        </View>
      ))}

      <View style={{ height: 108 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  members: { gap: 14, marginBottom: spacing.lg },
  memberCol: { alignItems: "center", width: 64 },
  memberRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  memberActive: { borderWidth: 2.5 },
  check: { position: "absolute", bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  statusDot: { position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: "#fff" },
  statusHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md },
  metrics: { flexDirection: "row", gap: 8 },
  metricBox: { flex: 1, alignItems: "center", padding: 8, borderRadius: 12, gap: 2 },
  hScroll: { gap: 12, paddingBottom: 8 },
  quickItem: { width: 72, alignItems: "center", gap: 8 },
  quickIcon: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  twoCol: { flexDirection: "row", gap: 10, marginBottom: spacing.md },
  colCard: { flex: 1 },
  colHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  appt: { paddingBottom: spacing.sm, marginBottom: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  medRow: { flexDirection: "row", gap: 8 },
  medAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  aiCard: { flexDirection: "row", gap: spacing.md, padding: spacing.md, borderRadius: 16, borderWidth: 1.5, marginBottom: spacing.md },
  aiIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#7C3AED", alignItems: "center", justifyContent: "center" },
  flex: { flex: 1 },
  aiHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  recordCard: { width: 100, alignItems: "center" },
  recordIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  actRow: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
});
