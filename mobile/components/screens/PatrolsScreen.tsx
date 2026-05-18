import { usePatrols } from "../../features/workforce";
import { GenericListScreen } from "./GenericListScreen";

export function PatrolsScreen() {
  const { data, isLoading, refetch, isRefetching } = usePatrols();

  return (
    <GenericListScreen
      title="Tuần tra"
      subtitle="Tuyến & checkpoint"
      loading={isLoading}
      onRefresh={refetch}
      refreshing={isRefetching}
      items={(data ?? []).map((p) => ({
        id: p.id,
        title: (p as { buildings?: { name: string } }).buildings?.name ?? "Tuyến tuần tra",
        subtitle: `Hoàn thành ${p.completion}% · ${p.status}`,
        badge: p.status,
        badgeStatus: p.status === "missed" ? "critical" : "active",
      }))}
    />
  );
}
