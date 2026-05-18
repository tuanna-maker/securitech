import { View, Text, StyleSheet } from "react-native";
import { Screen } from "../ui/Screen";
import { KpiCard } from "../ui/Card";
import { useBuildingStats } from "../../features/buildings";
import { useTheme } from "../../hooks/useTheme";

export function DashboardScreen() {
  const stats = useBuildingStats();
  const { colors } = useTheme();

  return (
    <Screen
      title="Command Center"
      subtitle="Trung tâm điều hành"
      loading={stats.isLoading}
      onRefresh={() => {}}
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
        <KpiCard label="Sự cố nghiêm trọng" value={stats.totalCriticalIncidents} accent={colors.danger} />
      </View>
      <Text style={[styles.section, { color: colors.text }]}>Tòa nhà gần đây</Text>
      {stats.buildings.slice(0, 5).map((b) => (
        <View key={b.id} style={[styles.building, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.bName, { color: colors.text }]}>{b.name}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
            {b.region || "—"} · SLA {b.sla_percent}% · BV {b.staff_online}/{b.staff_total}
          </Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kpiRow: { flexDirection: "row", gap: 8 },
  section: { fontSize: 16, fontWeight: "600", marginTop: 8, marginBottom: 8 },
  building: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  bName: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
});
