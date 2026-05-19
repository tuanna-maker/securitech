import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { AppStatus } from "../types/app";

type PgEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export type RealtimeTableSpec = {
  table: string;
  event?: PgEvent;
  filter?: string;
};

export function subscribeRequestUpdates(
  client: SupabaseClient,
  requestId: string,
  table: "quick_service_requests" | "support_requests",
  onUpdate: (row: { app_status?: AppStatus | null }) => void
): RealtimeChannel {
  return client
    .channel(`req:${table}:${requestId}`)
    .on("postgres_changes", { event: "UPDATE", schema: "public", table, filter: `id=eq.${requestId}` }, (payload) => {
      onUpdate(payload.new as { app_status?: AppStatus | null });
    })
    .subscribe();
}

export function subscribeLifeRequestEvents(
  client: SupabaseClient,
  requestId: string,
  onEvent: (row: { to_status: string; request_type: string }) => void
): RealtimeChannel {
  return client
    .channel(`life-ev:${requestId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "life_request_events", filter: `request_id=eq.${requestId}` },
      (payload) => onEvent(payload.new as { to_status: string; request_type: string })
    )
    .subscribe();
}

export function subscribeGuardPings(
  client: SupabaseClient,
  requestId: string,
  onPing: (row: { lat: number; lng: number }) => void
): RealtimeChannel {
  return client
    .channel(`pings:${requestId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "guard_location_pings", filter: `request_id=eq.${requestId}` },
      (payload) => onPing(payload.new as { lat: number; lng: number })
    )
    .subscribe();
}

/** Subscribe nhiều bảng trên cùng channel — dùng invalidate React Query. */
export function subscribePostgresChanges(
  client: SupabaseClient,
  channelName: string,
  specs: RealtimeTableSpec[],
  onChange: () => void
): RealtimeChannel {
  let ch = client.channel(channelName);
  for (const spec of specs) {
    ch = ch.on(
      "postgres_changes",
      {
        event: spec.event ?? "*",
        schema: "public",
        table: spec.table,
        ...(spec.filter ? { filter: spec.filter } : {}),
      },
      onChange
    );
  }
  return ch.subscribe();
}

export function subscribeBuildingServiceQueue(
  client: SupabaseClient,
  buildingId: string,
  onChange: () => void
): RealtimeChannel {
  const filter = `building_id=eq.${buildingId}`;
  return subscribePostgresChanges(
    client,
    `queue:${buildingId}`,
    [
      { table: "quick_service_requests", event: "*", filter },
      { table: "support_requests", event: "*", filter },
    ],
    onChange
  );
}

export function subscribeResidentParcels(
  client: SupabaseClient,
  residentId: string,
  onChange: () => void
): RealtimeChannel {
  return subscribePostgresChanges(
    client,
    `parcels:${residentId}`,
    [{ table: "parcels", event: "*", filter: `resident_id=eq.${residentId}` }],
    onChange
  );
}

export function subscribeBuildingAnnouncements(
  client: SupabaseClient,
  buildingId: string,
  onChange: () => void
): RealtimeChannel {
  return subscribePostgresChanges(
    client,
    `announcements:${buildingId}`,
    [{ table: "announcements", event: "INSERT", filter: `building_id=eq.${buildingId}` }],
    onChange
  );
}

export function subscribeResidentActiveRequests(
  client: SupabaseClient,
  residentId: string,
  onChange: () => void
): RealtimeChannel {
  return subscribePostgresChanges(
    client,
    `active-req:${residentId}`,
    [{ table: "quick_service_requests", event: "*", filter: `resident_id=eq.${residentId}` }],
    onChange
  );
}
