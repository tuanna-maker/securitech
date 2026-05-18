import { useResidentServiceStats } from "../../features/residents";
import { Screen } from "../ui/Screen";
import { KpiCard } from "../ui/Card";
import { useParcels, useSupportRequests } from "../../features/residents";
import { ListRow } from "../ui/ListRow";
import { View, StyleSheet, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export function ResidentServicesScreen() {
  const { data: stats, isLoading, refetch, isRefetching } = useResidentServiceStats();
  const { data: parcels } = useParcels();
  const { data: requests } = useSupportRequests();
  const { colors } = useTheme();

  return (
    <Screen title="Dịch vụ cư dân" loading={isLoading} onRefresh={refetch} refreshing={isRefetching}>
      <View style={styles.kpiRow}>
        <KpiCard label="Bưu phẩm chờ" value={stats?.pendingParcels ?? 0} />
        <KpiCard label="Yêu cầu mở" value={stats?.openRequests ?? 0} />
      </View>
      <Text style={[styles.h, { color: colors.text }]}>Bưu phẩm</Text>
      {(parcels ?? []).slice(0, 15).map((p) => (
        <ListRow
          key={p.id}
          title={(p as { residents?: { full_name: string } }).residents?.full_name ?? "Bưu phẩm"}
          subtitle={(p as { residents?: { apartment: string } }).residents?.apartment ?? p.parcel_type ?? ""}
          right={p.status}
        />
      ))}
      <Text style={[styles.h, { color: colors.text }]}>Yêu cầu hỗ trợ</Text>
      {(requests ?? []).slice(0, 15).map((r) => (
        <ListRow key={r.id} title={r.title} subtitle={r.category ?? r.description?.slice(0, 50) ?? ""} right={r.status} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  h: { fontSize: 15, fontWeight: "600", marginVertical: 8 },
});
