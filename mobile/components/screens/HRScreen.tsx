import { useEmployees, useHRStats } from "../../features/hr";
import { Screen } from "../ui/Screen";
import { KpiCard } from "../ui/Card";
import { ListRow } from "../ui/ListRow";
import { View, StyleSheet } from "react-native";

export function HRScreen() {
  const { data: empResult, isLoading, refetch, isRefetching } = useEmployees({ limit: 100 });
  const employees = empResult?.data ?? [];
  const { data: stats } = useHRStats();

  return (
    <Screen title="Nhân sự" loading={isLoading} onRefresh={refetch} refreshing={isRefetching}>
      <View style={styles.kpiRow}>
        <KpiCard label="Tổng NV" value={stats?.totalEmployees ?? 0} />
        <KpiCard label="Chờ duyệt nghỉ" value={stats?.pendingLeaves ?? 0} />
      </View>
      {(employees ?? []).map((e) => (
        <ListRow
          key={e.id}
          title={e.full_name}
          subtitle={`${e.position} · ${e.department ?? ""}`}
          right={e.status}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({ kpiRow: { flexDirection: "row", gap: 8, marginBottom: 8 } });
