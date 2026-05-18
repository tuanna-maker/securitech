import { useClients, useClientStats } from "../../features/crm";
import { Screen } from "../ui/Screen";
import { KpiCard } from "../ui/Card";
import { ListRow } from "../ui/ListRow";
import { View, StyleSheet } from "react-native";

export function CRMScreen() {
  const { data: clientResult, isLoading, refetch, isRefetching } = useClients();
  const clients = clientResult?.data ?? [];
  const { data: stats } = useClientStats();

  return (
    <Screen title="CRM" loading={isLoading} onRefresh={refetch} refreshing={isRefetching}>
      <View style={styles.kpiRow}>
        <KpiCard label="Khách hàng" value={stats?.total ?? 0} />
        <KpiCard label="Đang hoạt động" value={stats?.active ?? 0} />
      </View>
      {(clients ?? []).map((c) => (
        <ListRow key={c.id} title={c.name} subtitle={c.contact_person ?? c.email ?? ""} right={c.status} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({ kpiRow: { flexDirection: "row", gap: 8, marginBottom: 8 } });
