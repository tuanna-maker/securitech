import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { EmptyState, QueryErrorState, copy, trackEvent } from "@stos/mobile-shared";
import { Screen } from "../../components/ui/Screen";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { ListRow } from "../../components/ui/ListRow";
import { SkeletonList } from "../../components/shared/SkeletonList";
import { useAuth } from "../../hooks/useAuth";
import { useGuardRealtime } from "../../hooks/useGuardRealtime";
import { callFunction } from "../../lib/db";

type QueueItem = {
  id: string;
  source: "quick" | "support";
  service_type?: string;
  title?: string;
  app_status: string;
  priority_tier?: string;
  residents?: { full_name: string; apartment: string };
};

export default function QueueScreen() {
  const { staff } = useAuth();
  useGuardRealtime("queue");
  const { data, refetch, isRefetching, isLoading, isError } = useQuery({
    queryKey: ["queue", staff?.building_id],
    enabled: !!staff?.building_id,
    queryFn: async () => {
      const res = await callFunction<{ items: QueueItem[] }>("guard-handler", {
        query: { action: "queue", building_id: staff!.building_id! },
      });
      return (res as { items?: QueueItem[] }).items || (res as unknown as QueueItem[]) || [];
    },
  });

  const items = Array.isArray(data) ? data : [];

  return (
    <Screen title="Yêu cầu Life" subtitle={`${items.length} việc`} onRefresh={() => refetch()} refreshing={isRefetching}>
      {isLoading ? <SkeletonList /> : null}
      {isError ? <QueryErrorState onRetry={() => refetch()} /> : null}
      {!isLoading && !isError && items.length === 0 ? (
        <EmptyState
          illustration="empty-queue"
          title={copy.empty.queue.title}
          subtitle={copy.empty.queue.subtitle}
          onAction={() => trackEvent("empty_state_view", { screen: "queue" })}
        />
      ) : null}
      {!isLoading && !isError && items.length > 0 ? (
        <GroupedSection>
          {items.map((item, i, arr) => (
            <ListRow
              key={`${item.source}-${item.id}`}
              title={item.service_type || item.title || "Yêu cầu"}
              subtitle={`${item.residents?.apartment} · ${item.app_status} · ${item.priority_tier || "normal"}`}
              onPress={() => router.push({ pathname: "/queue/[id]", params: { id: item.id, source: item.source } })}
              showChevron
              isLast={i === arr.length - 1}
            />
          ))}
        </GroupedSection>
      ) : null}
    </Screen>
  );
}
