import { useQuery } from "@tanstack/react-query";
import { Screen } from "../../components/ui/Screen";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { ListRow } from "../../components/ui/ListRow";
import { SkeletonList } from "../../components/shared/SkeletonList";
import { useAuth } from "../../hooks/useAuth";
import { db } from "../../lib/db";

export default function FarmOrdersScreen() {
  const { resident } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["farm-orders", resident?.id],
    queryFn: async () => {
      const { data: rows } = await db.from("farm_orders").select("*").eq("resident_id", resident!.id).order("created_at", { ascending: false });
      return rows ?? [];
    },
    enabled: !!resident,
  });

  return (
    <Screen title="Đơn Farm Fresh">
      {isLoading ? <SkeletonList /> : (
        <GroupedSection>
          {(data ?? []).map((o, i) => (
            <ListRow key={o.id} title={`Đơn #${o.id.slice(0, 8)}`} subtitle={o.status} right={`${o.total_amount}`} isLast={i === (data?.length ?? 0) - 1} />
          ))}
        </GroupedSection>
      )}
    </Screen>
  );
}
