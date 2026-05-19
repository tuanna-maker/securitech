import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Screen } from "../../components/ui/Screen";
import { GuardHomeHeader } from "../../components/guard/GuardHomeHeader";
import { GuardProfileCard } from "../../components/home/GuardProfileCard";
import { GuardMainActions } from "../../components/home/GuardMainActions";
import { useAuth } from "../../hooks/useAuth";
import { useGuardRealtime } from "../../hooks/useGuardRealtime";
import { callFunction } from "../../lib/db";

export default function GuardHomeScreen() {
  const { staff, onDuty } = useAuth();
  useGuardRealtime("home");

  const { data: queueItems } = useQuery({
    queryKey: ["queue-kpi", staff?.building_id],
    enabled: !!staff?.building_id,
    queryFn: async () => {
      const res = await callFunction<{ items: unknown[] }>("guard-handler", {
        query: { action: "queue", building_id: staff!.building_id! },
      });
      return (res as { items?: unknown[] }).items || [];
    },
  });

  const queueCount = Array.isArray(queueItems) ? queueItems.length : 0;
  const shiftLabel = onDuty ? "Ca sáng: 06:00 – 14:00" : "Chưa có ca hôm nay";

  return (
    <Screen title="" largeTitle={false} scroll>
      <GuardHomeHeader notifyCount={queueCount > 0 ? queueCount : 3} />
      <GuardProfileCard name={staff?.name || "Nguyễn Văn Hùng"} shiftLabel={shiftLabel} onDuty={onDuty} />
      <GuardMainActions onDuty={onDuty} queueCount={queueCount} />
      <View style={{ height: 100 }} />
    </Screen>
  );
}
