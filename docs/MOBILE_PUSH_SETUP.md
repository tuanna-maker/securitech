# STOS Mobile — Push notifications (FCM / APNs)

## Đã có trong code

- **Client:** `registerPushToken()` khi login (Life + Guard) → bảng `device_tokens`
- **Server:** `emitEvent()` → `dispatchPushForEvent()` → [Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/)
- **Deep link:** `usePushDeepLink()` trong root layout — field `data.url` (vd. `/grab/uuid`, `/queue/index`)
- **SQL:** `MOBILE_PUSH_TRIGGERS.sql` — bưu phẩm & thông báo BQL → `system_events`
- **Cron (tuỳ chọn):** `GET /functions/v1/push-dispatcher` xử lý `system_events` chưa `is_processed`

## Bước trên Expo / EAS (bắt buộc để nhận push thật)

### 1. Backend Supabase (SQL + Edge Functions)

Dán prompt cho Lovable: **[LOVABLE_MOBILE_BACKEND_PROMPT.md](./LOVABLE_MOBILE_BACKEND_PROMPT.md)**  
(SQL trên Lovable được; Edge Functions thường deploy qua **Supabase Dashboard / CLI** nếu Lovable không upload function.)

- `push-dispatcher` (mới)
- Cập nhật `guard-handler` + `_shared/audit.ts` + `_shared/push.ts` (push qua `emitEvent`)

### 2. Chạy SQL (Lovable SQL Editor hoặc Dashboard)

1. `MOBILE_REALTIME_PUBLICATION.sql`
2. `MOBILE_PUSH_TRIGGERS.sql`

### 3. Cấu hình credentials

**Android (FCM v1)**

1. [Firebase Console](https://console.firebase.google.com/) → project → Service account → JSON key
2. EAS: `cd apps/stos-life && eas credentials` → Android → FCM V1
3. Lặp lại cho `apps/stos-guard`

**iOS (APNs)**

1. Apple Developer → Keys → APNs
2. EAS: `eas credentials` → iOS → Push Notifications
3. Lặp lại cho Guard

### 4. Build dev client (không dùng Expo Go)

```bash
cd apps/stos-life
eas build --profile development --platform ios   # hoặc android
```

Cài bản build lên máy thật → đăng nhập → cho phép thông báo.

### 5. Kiểm tra

- Life gửi Grab → Guard nhận push “Yêu cầu mới”
- Guard accept → Life nhận “Anh đã nhận việc”
- BQL thêm bưu phẩm → Life “Bưu phẩm mới”

**Simulator:** push iOS simulator hạn chế; ưu tiên máy thật.

## Biến môi trường

| App | EAS `extra.eas.projectId` | File |
|-----|---------------------------|------|
| Life | `498d3d55-e61f-4d53-9891-27e92dd9c5cc` | `apps/stos-life/app.json` |
| Guard | (chạy `eas init` nếu chưa có) | `apps/stos-guard/app.json` |

`registerPushToken` dùng `projectId` này cho Expo push token.
