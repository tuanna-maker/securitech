import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeInvalidation } from "@stos/mobile-shared";
import { db } from "../lib/db";
import { useAuth } from "./useAuth";

/** Realtime invalidation cho các màn Life (home, parcels, history). */
export function useLifeRealtime(scope: "home" | "parcels" | "history") {
  const { resident } = useAuth();
  const queryClient = useQueryClient();
  const residentId = resident?.id;

  const { channelName, specs, queryKeys } = useMemo(() => {
    if (!residentId) {
      return { channelName: "life-idle", specs: [] as { table: string; event?: "*" | "INSERT" | "UPDATE"; filter?: string }[], queryKeys: [] as unknown[][] };
    }
    if (scope === "home") {
      return {
        channelName: `life-home-${residentId}`,
        specs: [{ table: "quick_service_requests", event: "*" as const, filter: `resident_id=eq.${residentId}` }],
        queryKeys: [["active-request", residentId]],
      };
    }
    if (scope === "parcels") {
      return {
        channelName: `life-parcels-${residentId}`,
        specs: [{ table: "parcels", event: "*" as const, filter: `resident_id=eq.${residentId}` }],
        queryKeys: [["parcels", residentId]],
      };
    }
    return {
      channelName: `life-history-${residentId}`,
      specs: [{ table: "quick_service_requests", event: "*" as const, filter: `resident_id=eq.${residentId}` }],
      queryKeys: [["history", residentId]],
    };
  }, [residentId, scope]);

  useRealtimeInvalidation(db, queryClient, {
    enabled: !!residentId,
    channelName,
    specs,
    queryKeys,
  });
}
