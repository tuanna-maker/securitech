export type GuardApiConfig = {
  callFunction: <T>(name: string, opts?: {
    method?: string;
    query?: Record<string, string>;
    body?: unknown;
  }) => Promise<T>;
};

export function createGuardApi(config: GuardApiConfig) {
  return {
    getQueue: (building_id: string) =>
      config.callFunction<{ items: unknown[] }>("guard-handler", { query: { action: "queue", building_id } }),
    attendance: (body: Record<string, unknown>) =>
      config.callFunction("guard-handler", { method: "POST", query: { action: "attendance" }, body }),
    accept: (request_id: string, source: "quick" | "support") =>
      config.callFunction("guard-handler", {
        method: "POST",
        query: { action: "accept" },
        body: { request_id, source },
      }),
    decline: (request_id: string, source: "quick" | "support", reason: string) =>
      config.callFunction("guard-handler", {
        method: "POST",
        query: { action: "decline" },
        body: { request_id, source, reason },
      }),
    transition: (body: {
      request_id: string;
      source: "quick" | "support";
      to_status: string;
      completion_note?: string;
    }) => config.callFunction("guard-handler", { method: "POST", query: { action: "transition" }, body }),
    locationPing: (body: { request_id: string; lat: number; lng: number; request_type?: string }) =>
      config.callFunction("guard-handler", { method: "POST", query: { action: "location-ping" }, body }),
    checkinVisitor: (qr_token: string) =>
      config.callFunction("guard-handler", {
        method: "POST",
        query: { action: "checkin-visitor" },
        body: { qr_token },
      }),
  };
}
