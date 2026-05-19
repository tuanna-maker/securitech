import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

type PushMessage = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

async function sendExpoPush(tokens: string[], message: PushMessage) {
  if (!tokens.length) return;
  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 100) chunks.push(tokens.slice(i, i + 100));

  for (const batch of chunks) {
    const messages = batch.map((to) => ({
      to,
      sound: "default",
      title: message.title,
      body: message.body,
      data: message.data ?? {},
    }));
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
  }
}

async function tokensForUsers(supabase: SupabaseClient, userIds: string[], appRole?: "life" | "guard") {
  if (!userIds.length) return [];
  let q = supabase.from("device_tokens").select("token").in("user_id", userIds);
  if (appRole) q = q.eq("app_role", appRole);
  const { data } = await q;
  return (data || []).map((r) => r.token as string).filter(Boolean);
}

async function guardUserIdsForBuilding(supabase: SupabaseClient, tenantId: string, buildingId: string) {
  const { data } = await supabase
    .from("staff_members")
    .select("user_id")
    .eq("tenant_id", tenantId)
    .eq("building_id", buildingId)
    .not("user_id", "is", null);
  return (data || []).map((r) => r.user_id as string).filter(Boolean);
}

async function residentUserId(supabase: SupabaseClient, residentId: string) {
  const { data } = await supabase.from("residents").select("user_id").eq("id", residentId).maybeSingle();
  return data?.user_id as string | undefined;
}

async function residentUserFromRequest(
  supabase: SupabaseClient,
  requestId: string,
  source: "quick" | "support" = "quick"
) {
  const table = source === "support" ? "support_requests" : "quick_service_requests";
  const { data } = await supabase.from(table).select("resident_id").eq("id", requestId).maybeSingle();
  if (!data?.resident_id) return undefined;
  return residentUserId(supabase, data.resident_id as string);
}

function lifePath(path: string) {
  return path;
}

function guardPath(path: string) {
  return path;
}

/** Gửi push theo loại system_event / business event. */
export async function dispatchPushForEvent(
  supabase: SupabaseClient,
  tenantId: string,
  eventType: string,
  payload: Record<string, unknown>
) {
  const buildingId = payload.building_id as string | undefined;
  const requestId = payload.request_id as string | undefined;
  let tokens: string[] = [];
  let message: PushMessage | null = null;

  switch (eventType) {
    case "life_request_created":
    case "support_request_created": {
      if (!buildingId) break;
      const guardUsers = await guardUserIdsForBuilding(supabase, tenantId, buildingId);
      tokens = await tokensForUsers(supabase, guardUsers, "guard");
      message = {
        title: "Yêu cầu mới",
        body: "Cư dân cần hỗ trợ — mở hàng đợi",
        data: { url: guardPath("/queue/index") },
      };
      break;
    }
    case "life_request_accepted": {
      const uid = requestId ? await residentUserFromRequest(supabase, requestId) : undefined;
      if (uid) tokens = await tokensForUsers(supabase, [uid], "life");
      message = {
        title: "Anh đã nhận việc",
        body: "Yêu cầu Grab đang được xử lý",
        data: { url: lifePath(requestId ? `/grab/${requestId}` : "/(tabs)") },
      };
      break;
    }
    case "life_request_completed": {
      const uid = requestId ? await residentUserFromRequest(supabase, requestId) : undefined;
      if (uid) tokens = await tokensForUsers(supabase, [uid], "life");
      message = {
        title: "Hoàn thành",
        body: "Anh đã hoàn thành hỗ trợ — đánh giá nhé",
        data: { url: lifePath(requestId ? `/grab/${requestId}/rate` : "/(tabs)") },
      };
      break;
    }
    case "life_request_status": {
      const uid = requestId ? await residentUserFromRequest(supabase, requestId) : undefined;
      const status = String(payload.to_status || "");
      if (uid) tokens = await tokensForUsers(supabase, [uid], "life");
      const labels: Record<string, string> = {
        en_route: "Anh đang đến",
        on_site: "Anh đang hỗ trợ bạn",
        expired: "Chưa có anh nhận — thử lại",
      };
      message = {
        title: "Cập nhật yêu cầu",
        body: labels[status] || `Trạng thái: ${status}`,
        data: { url: lifePath(requestId ? `/grab/${requestId}` : "/(tabs)") },
      };
      break;
    }
    case "sos_triggered": {
      if (!buildingId) break;
      const guardUsers = await guardUserIdsForBuilding(supabase, tenantId, buildingId);
      tokens = await tokensForUsers(supabase, guardUsers, "guard");
      message = {
        title: "SOS khẩn cấp",
        body: String(payload.caller_name || "Cư dân cần hỗ trợ ngay"),
        data: { url: guardPath("/sos") },
      };
      break;
    }
    case "parcel_received":
    case "parcel_status_changed": {
      const residentId = payload.resident_id as string | undefined;
      if (!residentId) break;
      const uid = await residentUserId(supabase, residentId);
      if (uid) tokens = await tokensForUsers(supabase, [uid], "life");
      message = {
        title: eventType === "parcel_received" ? "Bưu phẩm mới" : "Bưu phẩm cập nhật",
        body: "Mở app để xem chi tiết",
        data: { url: lifePath("/parcels/index") },
      };
      break;
    }
    case "announcement_published": {
      if (!buildingId) break;
      const guardUsers = await guardUserIdsForBuilding(supabase, tenantId, buildingId);
      tokens = await tokensForUsers(supabase, guardUsers, "guard");
      message = {
        title: "Thông báo BQL",
        body: String(payload.title || "Có tin mới"),
        data: { url: guardPath("/(tabs)/notifications") },
      };
      break;
    }
    case "guest_checked_in": {
      const residentId = payload.resident_id as string | undefined;
      if (!residentId) break;
      const uid = await residentUserId(supabase, residentId);
      if (uid) tokens = await tokensForUsers(supabase, [uid], "life");
      message = {
        title: "Khách đã đến",
        body: "Anh bảo vệ đã check-in khách của bạn",
        data: { url: lifePath("/guests/index") },
      };
      break;
    }
    default:
      break;
  }

  if (message && tokens.length) {
    await sendExpoPush(tokens, message);
  }
}
