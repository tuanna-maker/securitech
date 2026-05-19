import { useQuery } from "@tanstack/react-query";
import { EmptyState, QueryErrorState, copy, trackEvent } from "@stos/mobile-shared";
import { Screen } from "../../components/ui/Screen";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { ListRow } from "../../components/ui/ListRow";
import { SkeletonList } from "../../components/shared/SkeletonList";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../lib/db";

export default function FarmScreen() {
  const { resident } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["farm", resident?.building_id],
    enabled: !!resident?.building_id,
    queryFn: async () => {
      const { data: products } = await db.from("farm_products").select("*").eq("building_id", resident!.building_id).eq("is_active", true);
      return products || [];
    },
  });

  const rows = data || [];

  return (
    <Screen title="Farm Fresh" subtitle="Đặt thực phẩm tươi">
      {isLoading ? <SkeletonList /> : null}
      {isError ? <QueryErrorState onRetry={() => refetch()} /> : null}
      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState
          illustration="empty-farm"
          title={copy.empty.farm.title}
          subtitle={copy.empty.farm.subtitle}
          onAction={() => trackEvent("empty_state_view", { screen: "farm" })}
        />
      ) : null}
      {!isLoading && !isError && rows.length > 0 ? (
        <GroupedSection>
          {rows.map((p: { id: string; name: string; price: number; unit: string }, i, arr) => (
            <ListRow key={p.id} title={p.name} subtitle={`${p.price}đ / ${p.unit}`} isLast={i === arr.length - 1} />
          ))}
        </GroupedSection>
      ) : null}
    </Screen>
  );
}
