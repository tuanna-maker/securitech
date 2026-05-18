import { useInvoices, useFinanceStats } from "../../features/finance";
import { Screen } from "../ui/Screen";
import { KpiCard } from "../ui/Card";
import { ListRow } from "../ui/ListRow";
import { View, StyleSheet } from "react-native";

export function FinanceScreen() {
  const { data: invResult, isLoading, refetch, isRefetching } = useInvoices();
  const invoices = invResult?.data ?? [];
  const { data: stats } = useFinanceStats();

  return (
    <Screen title="Tài chính" loading={isLoading} onRefresh={refetch} refreshing={isRefetching}>
      <View style={styles.kpiRow}>
        <KpiCard label="Doanh thu" value={`${(stats?.totalRevenue ?? 0).toLocaleString()}đ`} />
        <KpiCard label="Quá hạn" value={`${(stats?.overdueAmount ?? 0).toLocaleString()}đ`} />
      </View>
      {(invoices ?? []).slice(0, 30).map((inv) => (
        <ListRow
          key={inv.id}
          title={inv.invoice_number}
          subtitle={(inv as { clients?: { name: string } }).clients?.name}
          right={inv.status}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({ kpiRow: { flexDirection: "row", gap: 8, marginBottom: 8 } });
