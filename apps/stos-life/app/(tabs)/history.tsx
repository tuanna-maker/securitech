import { useQuery } from "@tanstack/react-query";
import { EmptyState, QueryErrorState, copy, trackEvent } from "@stos/mobile-shared";
import { Screen } from "../../components/ui/Screen";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { ListRow } from "../../components/ui/ListRow";
import { SkeletonList } from "../../components/shared/SkeletonList";
import { useAuth } from "../../hooks/useAuth";
import { useLifeRealtime } from "../../hooks/useLifeRealtime";
import { db } from "../../lib/db";

export default function HistoryScreen() {
  const { resident } = useAuth();
  useLifeRealtime("history");
  const { data: items, isLoading, isError, refetch } = useQuery({
    queryKey: ["history", resident?.id],
    enabled: !!resident?.id,
    queryFn: async () => {
      const { data } = await db
        .from("quick_service_requests")
        .select("id, service_type, app_status, created_at")
        .eq("resident_id", resident!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  const rows = items || [];

  return (
    <Screen title="Lịch sử yêu cầu">
      {isLoading ? <SkeletonList /> : null}
      {isError ? <QueryErrorState onRetry={() => refetch()} /> : null}
      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState
          illustration="empty-history"
          title={copy.empty.history.title}
          subtitle={copy.empty.history.subtitle}
          onAction={() => trackEvent("empty_state_view", { screen: "history" })}
        />
      ) : null}
      {!isLoading && !isError && rows.length > 0 ? (
        <GroupedSection>
          {rows.map((item, i, arr) => (
            <ListRow
              key={item.id}
              title={item.service_type}
              subtitle={`${item.app_status} · ${new Date(item.created_at).toLocaleString("vi-VN")}`}
              isLast={i === arr.length - 1}
            />
          ))}
        </GroupedSection>
      ) : null}
    </Screen>
  );
}
