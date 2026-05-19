import { View, Text, StyleSheet } from "react-native";
import { Screen } from "../ui/Screen";
import { KpiCard } from "../ui/Card";
import { GroupedSection } from "../ui/GroupedSection";
import { ListRow } from "../ui/ListRow";
import { useBuildingStats } from "../../features/buildings";
import { useTheme } from "../../hooks/useTheme";
import { spacing, textStyle } from "../../lib/design";

export function DashboardScreen() {
  const stats = useBuildingStats();
  const { colors } = useTheme();

  return (
    <Screen
      title="Tổng quan"
      subtitle="Command Center"
      loading={stats.isLoading}
      onRefresh={() => void stats.refetch()}
      refreshing={stats.isRefetching}
    >
      <View style={styles.kpiRow}>
        <KpiCard label="Tòa nhà" value={stats.total} />
        <KpiCard label="Sự cố hôm nay" value={stats.totalIncidents} accent={colors.danger} />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard label="Nhân viên online" value={`${stats.totalStaffOnline}/${stats.totalStaff}`} />
        <KpiCard label="SLA trung bình" value={`${stats.avgSla}%`} accent={colors.success} />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard label="Cảnh báo" value={stats.critical + stats.warning} accent={colors.warning} />
        <KpiCard label="Nghiêm trọng" value={stats.totalCriticalIncidents} accent={colors.danger} />
      </View>

      <Text style={[textStyle("footnote", "semibold"), styles.sectionLabel, { color: colors.textTertiary }]}>
        TÒA NHÀ GẦN ĐÂY
      </Text>
      <GroupedSection>
        {stats.buildings.slice(0, 5).map((b, i, arr) => (
          <ListRow
            key={b.id}
            title={b.name}
            subtitle={`${b.region || "—"} · SLA ${b.sla_percent}% · BV ${b.staff_online}/${b.staff_total}`}
            icon="business"
            isLast={i === arr.length - 1}
          />
        ))}
        {stats.buildings.length === 0 ? (
          <ListRow title="Chưa có dữ liệu tòa nhà" subtitle="Kéo xuống để làm mới" isLast />
        ) : null}
      </GroupedSection>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kpiRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  sectionLabel: { marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: 4 },
});
