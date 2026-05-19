import { useEffect } from "react";
import type { QueryKey, SupabaseClient } from "@supabase/supabase-js";
import { subscribePostgresChanges, type RealtimeTableSpec } from "../realtime/subscriptions";

type Options = {
  enabled?: boolean;
  channelName: string;
  specs: RealtimeTableSpec[];
  queryKeys: QueryKey[];
  onInvalidate?: () => void;
};

/** Lắng nghe Supabase Realtime và gọi invalidateQueries — UI tự cập nhật không reload. */
export function useRealtimeInvalidation(
  client: SupabaseClient,
  queryClient: { invalidateQueries: (opts: { queryKey: QueryKey }) => void },
  options: Options
) {
  const { enabled = true, channelName, specs, queryKeys, onInvalidate } = options;

  useEffect(() => {
    if (!enabled || specs.length === 0) return;

    const bump = () => {
      for (const key of queryKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      onInvalidate?.();
    };

    const ch = subscribePostgresChanges(client, channelName, specs, bump);
    return () => {
      client.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- specs/queryKeys stabilized via useMemo in callers
  }, [client, queryClient, enabled, channelName]);
}
