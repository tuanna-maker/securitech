import { useAccessLogs } from "../../features/access";
import { GenericListScreen } from "./GenericListScreen";

export function AccessControlScreen() {
  const { data, isLoading, refetch, isRefetching } = useAccessLogs();

  return (
    <GenericListScreen
      title="Kiểm soát ra/vào"
      loading={isLoading}
      onRefresh={refetch}
      refreshing={isRefetching}
      items={(data ?? []).map((log) => ({
        id: log.id,
        title: log.visitor_name,
        subtitle: `${log.visitor_type} · ${log.building_name ?? ""}`,
        badge: log.checked_out_at ? "Đã ra" : "Trong tòa",
        badgeStatus: log.checked_out_at ? "resolved" : "active",
      }))}
    />
  );
}
