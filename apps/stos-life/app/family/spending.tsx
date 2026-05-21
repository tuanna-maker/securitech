import { View, Text, Pressable, StyleSheet } from "react-native";
import { StosIcon, type StosIconName } from "@stos/mobile-shared";
import { Screen } from "../../components/ui/Screen";
import { LifeHeader } from "../../components/life/LifeHeader";
import { SectionTitle } from "../../components/life/SectionTitle";
import { useTheme } from "../../hooks/useTheme";
import { brand } from "../../lib/brand";
import { useFamilySpending } from "../../hooks/useFamilySpending";
import { getFamilySpendingFallback } from "../../lib/familyApi";
import { openLifeFeature } from "../../lib/lifeNav";
import { MockCard } from "../../components/life/MockCard";
import { softCardShadow } from "@stos/mobile-shared";
import { radii, spacing, textStyle } from "../../lib/design";

const BOTTOM_ACTIONS: { label: string; icon: StosIconName }[] = [
  { label: "Thêm chi tiêu", icon: "add-person" },
  { label: "Xem báo cáo", icon: "chart" },
  { label: "Ngân sách", icon: "wallet" },
  { label: "Chia sẻ", icon: "share" },
];

export default function FamilySpendingScreen() {
  const { colors, life, isDark } = useTheme();
  const { data } = useFamilySpending();
  const SPENDING = data ?? getFamilySpendingFallback();
  const aiBg = isDark ? "rgba(124, 58, 237, 0.12)" : "#FAF5FF";
  const aiBorder = isDark ? "rgba(167, 139, 250, 0.4)" : "#DDD6FE";

  return (
    <Screen title="" largeTitle={false} scroll>
      <LifeHeader mode="minimal" title="Chi tiêu gia đình" notifyCount={3} rightIcons={["search", "calendar"]} />

      <Pressable style={[styles.monthPicker, { backgroundColor: colors.fill, borderColor: colors.border }]}>
        <Text style={[textStyle("subhead", "semibold"), { color: colors.text }]}>{SPENDING.month}</Text>
        <StosIcon name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>

      <MockCard style={{ marginBottom: spacing.lg, backgroundColor: life.bgCard, borderColor: life.border }}>
        <View style={styles.summaryTop}>
          <View style={styles.flex}>
            <View style={styles.totalRow}>
              <Text style={[textStyle("footnote"), { color: colors.textSecondary }]}>Tổng chi tháng 5</Text>
              <View style={{ marginLeft: 6 }}>
                <StosIcon name="eye" size={16} color={colors.textTertiary} />
              </View>
            </View>
            <Text style={[textStyle("title1", "bold"), { color: colors.text, marginTop: 4 }]}>{SPENDING.total}</Text>
            <Text style={[textStyle("caption1", "semibold"), { color: "#16A34A", marginTop: 4 }]}>{SPENDING.trend}</Text>
          </View>
          <View style={styles.donutWrap}>
            <View style={styles.donutOuter}>
              <View style={styles.donutHole}>
                <Text style={[textStyle("caption2", "bold"), { color: colors.text }]}>7</Text>
                <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>nhóm chi</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.legendGrid}>
          {SPENDING.groups.map((g) => (
            <View key={g.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: g.color }]} />
              <Text style={[textStyle("caption2"), { color: colors.text, flex: 1 }]}>{g.label}</Text>
              <Text style={[textStyle("caption2", "semibold"), { color: colors.text }]}>{g.pct}%</Text>
            </View>
          ))}
        </View>
        <View style={[styles.budgetTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.budgetFill, { width: `${SPENDING.budgetPct}%` }]} />
        </View>
        <View style={styles.budgetRow}>
          <StosIcon name="wallet" size={16} color="#16A34A" />
          <Text style={[textStyle("caption2"), { color: colors.textSecondary, flex: 1 }]}>
            Còn trong ngân sách {SPENDING.budgetLeft} ({SPENDING.budgetPct}%)
          </Text>
        </View>
      </MockCard>

      <View style={[styles.aiCard, { borderColor: aiBorder, backgroundColor: aiBg }]}>
        <View style={styles.aiRobot}>
          <StosIcon name="hardware-chip" size={22} color="#fff" />
        </View>
        <View style={styles.flex}>
          <View style={styles.aiHead}>
            <Text style={[textStyle("subhead", "bold"), { color: colors.text }]}>AI Insight</Text>
            <Pressable onPress={() => openLifeFeature("AI Insight chi tiêu")}>
              <Text style={[textStyle("caption2"), { color: brand.navyLight }]}>Xem chi tiết &gt;</Text>
            </Pressable>
          </View>
          {SPENDING.aiInsights.map((line, i) => (
            <View key={line} style={styles.aiLine}>
              <StosIcon
                name={i === 2 ? "warning-triangle" : i === 1 ? "wallet" : "chart"}
                size={14}
                color={i === 2 ? "#EA580C" : "#16A34A"}
              />
              <Text style={[textStyle("caption2"), { color: colors.textSecondary, flex: 1 }]}>{line}</Text>
            </View>
          ))}
        </View>
      </View>

      <SectionTitle title="NHÓM CHI TIÊU" link="Xem tất cả" onLink={() => openLifeFeature("Nhóm chi tiêu")} />
      <View style={styles.catGrid}>
        {SPENDING.categories.map((c) => (
          <MockCard
            key={c.label}
            radius={16}
            style={styles.catCard}
            onPress={() => openLifeFeature(c.label, "Chi tiêu")}
          >
            <View style={[styles.catIcon, { backgroundColor: c.bg }]}>
              <StosIcon name={c.icon} size={22} color={c.color} variant="filled" />
            </View>
            <Text style={[textStyle("caption1", "semibold"), { color: colors.text }]}>{c.label}</Text>
            <Text style={[textStyle("subhead", "bold"), { color: colors.text }]}>{c.amount}</Text>
            <Text style={[textStyle("caption2"), { color: c.up ? colors.danger : colors.success }]}>{c.trend}</Text>
          </MockCard>
        ))}
      </View>

      <SectionTitle title="GIAO DỊCH GẦN ĐÂY" link="Xem tất cả" onLink={() => openLifeFeature("Giao dịch")} />
      {SPENDING.transactions.map((t) => (
        <Pressable key={t.merchant + t.when} style={[styles.tx, { borderBottomColor: colors.border }]}>
          <View style={[styles.txLogo, { backgroundColor: colors.fill }]}>
            <StosIcon name={t.icon} size={20} color={brand.navy} />
          </View>
          <View style={styles.flex}>
            <Text style={[textStyle("subhead", "semibold"), { color: colors.text }]}>{t.merchant}</Text>
            <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>
              {t.cat} · {t.when}
            </Text>
          </View>
          <Text style={[textStyle("subhead", "semibold"), { color: colors.text }]}>{t.amount}</Text>
          <View style={{ marginLeft: 6 }}>
            <StosIcon name="card" size={18} color={colors.textTertiary} />
          </View>
        </Pressable>
      ))}

      <MockCard style={styles.bottomBar} radius={20}>
        {BOTTOM_ACTIONS.slice(0, 2).map((a) => (
          <Pressable key={a.label} style={styles.bottomItem} onPress={() => openLifeFeature(a.label)}>
            <StosIcon name={a.icon} size={22} color={brand.navy} />
            <Text style={[textStyle("caption2"), { color: colors.textSecondary }]}>{a.label}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.fabCenter} onPress={() => openLifeFeature("Chụp hóa đơn", "OCR hóa đơn")}>
          <View style={[styles.fabGlow, softCardShadow(isDark)]}>
            <StosIcon name="camera" size={28} color="#fff" variant="soft" />
          </View>
          <Text style={[textStyle("caption2", "bold"), { color: brand.navy, marginTop: 4 }]}>Chụp hóa đơn</Text>
        </Pressable>
        {BOTTOM_ACTIONS.slice(2).map((a) => (
          <Pressable key={a.label} style={styles.bottomItem} onPress={() => openLifeFeature(a.label)}>
            <StosIcon name={a.icon} size={22} color={brand.navy} />
            <Text style={[textStyle("caption2"), { color: colors.textSecondary }]}>{a.label}</Text>
          </Pressable>
        ))}
      </MockCard>

      <View style={{ height: 120 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  monthPicker: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  summaryTop: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  totalRow: { flexDirection: "row", alignItems: "center" },
  donutWrap: { alignItems: "center", justifyContent: "center" },
  donutOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 12,
    borderColor: "#2563EB",
    borderRightColor: "#7C3AED",
    borderBottomColor: "#F97316",
    borderLeftColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  donutHole: { alignItems: "center" },
  legendGrid: { marginTop: spacing.md, gap: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  budgetTrack: { height: 8, borderRadius: 4, marginTop: spacing.md, overflow: "hidden" },
  budgetFill: { height: "100%", backgroundColor: "#22C55E" },
  budgetRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  aiCard: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: "#FAF5FF",
    marginBottom: spacing.md,
  },
  aiRobot: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#7C3AED", alignItems: "center", justifyContent: "center" },
  aiHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  aiLine: { flexDirection: "row", gap: 8, marginTop: 6, alignItems: "flex-start" },
  catGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  catCard: { width: "48.2%" },
  catIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  tx: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: spacing.md },
  txLogo: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bottomBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: spacing.xl,
  },
  bottomItem: { alignItems: "center", width: 64, gap: 4 },
  fabCenter: { alignItems: "center", marginTop: -28 },
  fabGlow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
});
