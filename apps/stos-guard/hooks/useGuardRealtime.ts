import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeInvalidation } from "@stos/mobile-shared";
import { db } from "../lib/db";
import { useAuth } from "./useAuth";

/** Realtime invalidation cho queue KPI, hàng đợi, thông báo Guard. */
export function useGuardRealtime(scope: "queue" | "home" | "notifications") {
  const { staff } = useAuth();
  const queryClient = useQueryClient();
  const buildingId = staff?.building_id;

  const { channelName, specs, queryKeys } = useMemo(() => {
    if (!buildingId) {
      return { channelName: "guard-idle", specs: [] as { table: string; event?: "*" | "INSERT"; filter?: string }[], queryKeys: [] as unknown[][] };
    }
    const filter = `building_id=eq.${buildingId}`;
    if (scope === "notifications") {
      return {
        channelName: `guard-announce-${buildingId}`,
        specs: [{ table: "announcements", event: "INSERT" as const, filter }],
        queryKeys: [["announcements-guard", buildingId]],
      };
    }
    const queueSpecs = [
      { table: "quick_service_requests", event: "*" as const, filter },
      { table: "support_requests", event: "*" as const, filter },
    ];
    if (scope === "home") {
      return {
        channelName: `guard-home-${buildingId}`,
        specs: queueSpecs,
        queryKeys: [["queue-kpi", buildingId]],
      };
    }
    return {
      channelName: `guard-queue-${buildingId}`,
      specs: queueSpecs,
      queryKeys: [["queue", buildingId]],
    };
  }, [buildingId, scope]);

  useRealtimeInvalidation(db, queryClient, {
    enabled: !!buildingId,
    channelName,
    specs,
    queryKeys,
  });
}
