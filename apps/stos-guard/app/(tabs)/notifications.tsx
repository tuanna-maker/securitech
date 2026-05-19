import { useQuery } from "@tanstack/react-query";
import { EmptyState, QueryErrorState, trackEvent } from "@stos/mobile-shared";
import { Screen } from "../../components/ui/Screen";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { ListRow } from "../../components/ui/ListRow";
import { SkeletonList } from "../../components/shared/SkeletonList";
import { useAuth } from "../../hooks/useAuth";
import { useGuardRealtime } from "../../hooks/useGuardRealtime";
import { db } from "../../lib/db";

export default function NotificationsScreen() {
  const { staff } = useAuth();
  useGuardRealtime("notifications");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["announcements-guard", staff?.building_id],
    enabled: !!staff?.building_id,
    queryFn: async () => {
      const { data: rows } = await db.from("announcements").select("id, title, created_at").eq("building_id", staff!.building_id!).limit(20);
      return rows || [];
    },
  });

  const rows = data || [];

  return (
    <Screen title="Thông báo">
      {isLoading ? <SkeletonList /> : null}
      {isError ? <QueryErrorState onRetry={() => refetch()} /> : null}
      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState
          illustration="empty-notifications"
          title="Không có thông báo"
          subtitle="Tin từ BQL sẽ hiện tại đây."
          onAction={() => trackEvent("empty_state_view", { screen: "notifications" })}
        />
      ) : null}
      {!isLoading && !isError && rows.length > 0 ? (
        <GroupedSection>
          {rows.map((a, i, arr) => (
            <ListRow key={a.id} title={a.title} isLast={i === arr.length - 1} />
          ))}
        </GroupedSection>
      ) : null}
    </Screen>
  );
}
