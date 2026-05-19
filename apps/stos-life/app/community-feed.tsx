import { useQuery } from "@tanstack/react-query";
import { EmptyState, QueryErrorState } from "@stos/mobile-shared";
import { Screen } from "../components/ui/Screen";
import { GroupedSection } from "../components/ui/GroupedSection";
import { ListRow } from "../components/ui/ListRow";
import { SkeletonList } from "../components/shared/SkeletonList";
import { useAuth } from "../hooks/useAuth";
import { db } from "../lib/db";

/** Cộng đồng / thông báo BQL — mở từ header hoặc Dịch vụ bảo an */
export default function CommunityFeedScreen() {
  const { resident } = useAuth();
  const { data: announcements, isLoading, isError, refetch } = useQuery({
    queryKey: ["announcements", resident?.building_id],
    enabled: !!resident?.building_id,
    queryFn: async () => {
      const { data } = await db
        .from("announcements")
        .select("id, title, created_at")
        .eq("building_id", resident!.building_id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const rows = announcements || [];

  return (
    <Screen title="Cộng đồng" subtitle="Thông báo từ BQL">
      {isLoading ? <SkeletonList /> : null}
      {isError ? <QueryErrorState onRetry={() => refetch()} /> : null}
      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState illustration="empty-notifications" title="Chưa có thông báo" subtitle="Tin từ ban quản lý sẽ hiện tại đây." />
      ) : null}
      {!isLoading && !isError && rows.length > 0 ? (
        <GroupedSection>
          {rows.map((a, i, arr) => (
            <ListRow key={a.id} title={a.title} subtitle={new Date(a.created_at).toLocaleDateString("vi-VN")} isLast={i === arr.length - 1} />
          ))}
        </GroupedSection>
      ) : null}
    </Screen>
  );
}
