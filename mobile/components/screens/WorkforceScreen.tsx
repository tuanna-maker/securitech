import { useShifts, useWorkforceStats } from "../../features/workforce";
import { KpiCard } from "../ui/Card";
import { ListRow } from "../ui/ListRow";
import { View, StyleSheet } from "react-native";
import { Screen } from "../ui/Screen";

export function WorkforceScreen() {
  const { data: shifts, isLoading, refetch, isRefetching } = useShifts();
  const { data: stats } = useWorkforceStats();

  return (
    <Screen title="Ca trực" subtitle="Lịch ca & nhân sự" loading={isLoading} onRefresh={refetch} refreshing={isRefetching}>
      <View style={styles.kpiRow}>
        <KpiCard label="Nhân sự" value={stats?.totalStaff ?? 0} />
        <KpiCard label="Online" value={stats?.onlineStaff ?? 0} />
      </View>
      {(shifts ?? []).map((s) => (
        <ListRow
          key={s.id}
          title={`${s.shift_date} · ${s.shift_type}`}
          subtitle={s.staff_name ?? ""}
          right={s.status}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
});
