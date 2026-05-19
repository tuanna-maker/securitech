import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppStatus } from "../types/app";
import { subscribeRequestUpdates } from "../realtime/subscriptions";

export function useLifeRequest(
  client: SupabaseClient,
  requestId: string | undefined,
  table: "quick_service_requests" | "support_requests" = "quick_service_requests"
) {
  const [appStatus, setAppStatus] = useState<AppStatus | null>(null);

  useEffect(() => {
    if (!requestId) return;
    client
      .from(table)
      .select("app_status")
      .eq("id", requestId)
      .single()
      .then(({ data }) => setAppStatus((data?.app_status as AppStatus) ?? null));

    const ch = subscribeRequestUpdates(client, requestId, table, (row) => {
      if (row.app_status) setAppStatus(row.app_status);
    });
    return () => {
      client.removeChannel(ch);
    };
  }, [client, requestId, table]);

  return { appStatus, isExpired: appStatus === "expired" };
}
