import { useReportOverview } from "../../features/reports";
import { Screen } from "../ui/Screen";
import { KpiCard } from "../ui/Card";
import { View, StyleSheet } from "react-native";

export function ReportsScreen() {
  const { data, isLoading, refetch, isRefetching } = useReportOverview();

  return (
    <Screen title="Báo cáo" subtitle="Tổng quan" loading={isLoading} onRefresh={refetch} refreshing={isRefetching}>
      <View style={styles.kpiRow}>
        <KpiCard label="Sự cố" value={data?.totalIncidents ?? 0} />
        <KpiCard label="Khách mới" value={data?.newClients ?? 0} />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard label="Nhân sự" value={data?.totalStaff ?? 0} />
        <KpiCard label="Khách hàng" value={data?.totalClients ?? 0} />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard label="Doanh thu" value={data?.totalRevenue ?? "0"} />
        <KpiCard label="SLA TB" value={data?.avgSla ?? "0%"} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ kpiRow: { flexDirection: "row", gap: 8, marginBottom: 8 } });
