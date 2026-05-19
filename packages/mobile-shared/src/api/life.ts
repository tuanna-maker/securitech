import type { AppStatus } from "../types/app";

export type LifeApiConfig = {
  callFunction: <T>(name: string, opts?: {
    method?: string;
    query?: Record<string, string>;
    body?: unknown;
  }) => Promise<T>;
};

export function createLifeApi(config: LifeApiConfig) {
  return {
    activate: (code: string) =>
      config.callFunction("life-handler", { method: "POST", query: { action: "activate" }, body: { code } }),
    cancelRequest: (request_id: string, reason?: string) =>
      config.callFunction("life-handler", {
        method: "POST",
        query: { action: "cancel-request" },
        body: { request_id, reason },
      }),
    rate: (body: { request_id: string; request_type: "quick" | "support"; stars: number; comment?: string }) =>
      config.callFunction("life-handler", { method: "POST", query: { action: "rate" }, body }),
    listInvites: () => config.callFunction<{ data: unknown[] }>("life-handler", { query: { action: "visitor-invite" } }),
    createInvite: (body: Record<string, unknown>) =>
      config.callFunction("life-handler", { method: "POST", query: { action: "visitor-invite" }, body }),
    updatePreferences: (preferences: Record<string, boolean>) =>
      config.callFunction("life-handler", { method: "PATCH", query: { action: "preferences" }, body: { preferences } }),
    familyDashboard: () =>
      config.callFunction("life-handler", { query: { action: "family-dashboard" } }),
    familySpending: (year: number, month: number) =>
      config.callFunction("life-handler", {
        query: { action: "family-spending", year: String(year), month: String(month) },
      }),
  };
}

export const STATUS_LABELS: Record<AppStatus, string> = {
  submitted: "Đang tìm anh hỗ trợ…",
  accepted: "Anh đã nhận việc",
  en_route: "Anh đang đến",
  on_site: "Anh đang hỗ trợ bạn",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  expired: "Chưa có anh nhận — liên hệ lễ tân",
  escalated: "Điều phối đang xử lý",
};
