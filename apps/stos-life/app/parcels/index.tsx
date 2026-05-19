import { useQuery } from "@tanstack/react-query";
import { EmptyState, QueryErrorState, copy, trackEvent } from "@stos/mobile-shared";
import { Image } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { ListRow } from "../../components/ui/ListRow";
import { SkeletonList } from "../../components/shared/SkeletonList";
import { useAuth } from "../../hooks/useAuth";
import { useLifeRealtime } from "../../hooks/useLifeRealtime";
import { db } from "../../lib/db";

export default function ParcelsScreen() {
  const { resident } = useAuth();
  useLifeRealtime("parcels");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["parcels", resident?.id],
    enabled: !!resident?.id,
    queryFn: async () => {
      const { data: rows } = await db.from("parcels").select("*").eq("resident_id", resident!.id).order("received_at", { ascending: false });
      return rows || [];
    },
  });

  const rows = data || [];

  return (
    <Screen title="Bưu phẩm">
      {isLoading ? <SkeletonList /> : null}
      {isError ? <QueryErrorState onRetry={() => refetch()} /> : null}
      {!isLoading && !isError && rows.length === 0 ? (
        <EmptyState
          illustration="empty-parcels"
          title={copy.empty.parcels.title}
          subtitle={copy.empty.parcels.subtitle}
          onAction={() => trackEvent("empty_state_view", { screen: "parcels" })}
        />
      ) : null}
      {!isLoading && !isError && rows.length > 0 ? (
        <GroupedSection>
          {rows.map((p: { id: string; sender?: string; status: string; photo_url?: string }, i, arr) => (
            <ListRow
              key={p.id}
              title={p.sender || "Bưu phẩm"}
              subtitle={p.status}
              isLast={i === arr.length - 1}
              right={
                p.photo_url ? (
                  <Image source={{ uri: p.photo_url }} style={{ width: 48, height: 48, borderRadius: 8 }} resizeMode="cover" />
                ) : undefined
              }
            />
          ))}
        </GroupedSection>
      ) : null}
    </Screen>
  );
}
