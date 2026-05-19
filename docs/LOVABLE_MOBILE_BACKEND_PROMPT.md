# Prompt cho Lovable — STOS Mobile: Realtime + Push

> **Deploy Edge Functions qua Lovable (không CLI):** dùng **[LOVABLE_EDGE_FUNCTIONS_PROMPT.md](./LOVABLE_EDGE_FUNCTIONS_PROMPT.md)** + file `supabase/functions/FILES_FOR_LOVABLE.txt`.

**Cách dùng:** Copy toàn bộ nội dung trong khối `PROMPT` bên dưới và dán vào chat Lovable (hoặc task backend). Repo đã có code sẵn — Lovable chỉ cần **áp dụng SQL + deploy Edge Functions** lên **cùng Supabase project** đang dùng cho STOS.

---

## PROMPT (copy từ đây)

```
Bạn là backend engineer cho dự án STOS (Supabase). Nhiệm vụ: bật **Supabase Realtime** và **push notification (Expo)** cho 2 app mobile STOS Life (cư dân) và STOS Guard (bảo vệ). Code TypeScript/SQL đã có trong repo — hãy deploy/apply đúng, không viết lại logic khác.

### Ngữ cảnh

- Mobile apps: STOS Life + STOS Guard (Expo React Native)
- Khi login, app lưu Expo push token vào bảng `public.device_tokens` (cột: user_id, tenant_id, app_role = 'life'|'guard', token, platform)
- App đã subscribe Realtime phía client — cần bật publication trên DB
- Push gửi qua **Expo Push API** `https://exp.host/--/api/v2/push/send` (không cần FCM key trên Supabase; FCM/APNs cấu hình ở Expo/EAS phía client)

### Điều kiện tiên quyết

Đã chạy trước đó (nếu chưa thì chạy trước):
- `supabase/scripts/STOS_MOBILE_FULL_SETUP.sql`
- `supabase/scripts/SEED_MOBILE_DEMO.sql` (tuỳ chọn demo)

Bảng cần tồn tại: `device_tokens`, `system_events`, `quick_service_requests`, `support_requests`, `parcels`, `announcements`, `life_request_events`, `residents`, `staff_members`.

---

## PHẦN A — SQL (chạy trong Supabase SQL Editor, theo thứ tự)

### A1. Realtime publication

Chạy **toàn bộ** file `supabase/scripts/MOBILE_REALTIME_PUBLICATION.sql` (idempotent).

Hoặc chạy trực tiếp:

```sql
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.quick_service_requests;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.support_requests;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.parcels;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_calls;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.system_events;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
```

**Kết quả mong đợi:** Các bảng trên xuất hiện trong publication `supabase_realtime` (kiểm tra `pg_publication_tables`).

### A2. Trigger bưu phẩm & thông báo BQL

Chạy **toàn bộ** file `supabase/scripts/MOBILE_PUSH_TRIGGERS.sql`.

Tạo function `emit_mobile_system_event()` + trigger trên `parcels` (INSERT/UPDATE status) và `announcements` (INSERT) → ghi `system_events` với `is_processed = false`.

### A3. (Quan trọng) Webhook hoặc cron cho push từ trigger SQL

Các event từ **trigger SQL** (parcel, announcement) chỉ insert `system_events` — **chưa tự gửi push**. Chọn **một** cách:

**Cách 1 — Database Webhook (khuyến nghị)**  
Supabase Dashboard → Database → Webhooks → Create:
- Table: `system_events`
- Event: `INSERT`
- Filter (tuỳ chọn): `is_processed = false`
- HTTP POST tới: `https://<PROJECT_REF>.supabase.co/functions/v1/push-dispatcher`
- Header: `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`
- Body mẫu JSON:
```json
{
  "event_type": "{{ record.event_type }}",
  "tenant_id": "{{ record.tenant_id }}",
  "payload": {{ record.payload }}
}
```

**Cách 2 — Scheduled Edge Function**  
Cron mỗi 1–5 phút: `GET https://<PROJECT_REF>.supabase.co/functions/v1/push-dispatcher` với header `Authorization: Bearer <SERVICE_ROLE_KEY>`  
(Function xử lý các row `system_events` where `is_processed = false`.)

---

## PHẦN B — Edge Functions (deploy lên Supabase)

Deploy **toàn bộ thư mục** từ repo (Deno). Các file **bắt buộc**:

### B1. File mới

| Function | Đường dẫn |
|----------|-----------|
| `push-dispatcher` | `supabase/functions/push-dispatcher/index.ts` |
| Shared push | `supabase/functions/_shared/push.ts` |

### B2. File cập nhật (đã sửa trong repo)

| File | Thay đổi chính |
|------|------------------|
| `supabase/functions/_shared/audit.ts` | `emitEvent()` gọi `dispatchPushForEvent()` rồi insert `system_events` với `is_processed: true` |
| `supabase/functions/guard-handler/index.ts` | Sau `transition`, emit `life_request_status` khi `to_status` ∈ en_route, on_site, expired |
| `service-handler`, `sos-handler`, `life-handler` | Không bắt buộc sửa thêm nếu đã gọi `emitEvent()` khi tạo request / SOS |

**`emitEvent` hiện tại** (không đổi signature):
1. Gửi push ngay qua `_shared/push.ts`
2. Ghi audit vào `system_events` (đã processed)

### B3. `push-dispatcher` API

- `POST` body: `{ "event_type": string, "tenant_id": uuid, "payload": object }` → gửi Expo push
- `GET` ?limit=20 → xử lý backlog `system_events` where `is_processed = false`

Verify JWT: **tắt** cho function này nếu chỉ gọi bằng service role từ webhook/cron; hoặc bật và dùng service role key trong Authorization header.

### B4. Logic push (`_shared/push.ts`) — map event → người nhận

| event_type | Gửi tới | Tiêu đề (VN) |
|------------|---------|--------------|
| `life_request_created`, `support_request_created` | Guards (`device_tokens.app_role=guard`) cùng `building_id` | Yêu cầu mới |
| `life_request_accepted` | Resident (user của request) | Anh đã nhận việc |
| `life_request_completed` | Resident | Hoàn thành |
| `life_request_status` (en_route, on_site, expired) | Resident | Cập nhật yêu cầu |
| `sos_triggered` | Guards cùng building | SOS khẩn cấp |
| `parcel_received`, `parcel_status_changed` | Resident | Bưu phẩm |
| `announcement_published` | Guards cùng building | Thông báo BQL |
| `guest_checked_in` | Resident | Khách đã đến |

Payload push có `data.url` (deep link trong app), ví dụ: `/queue/index`, `/grab/<request_id>`.

**Nguồn event từ Edge Functions (đã emit sẵn trong code):**
- `service-handler` POST quick → `life_request_created` + `building_id`, `request_id`
- `guard-handler` accept → `life_request_accepted`
- `guard-handler` transition completed → `life_request_completed`
- `guard-handler` transition en_route/on_site/expired → `life_request_status` + `to_status`
- `sos-handler` POST → `sos_triggered`
- `guard-handler` checkin visitor → `guest_checked_in`

### B5. Secrets Edge Functions

Đảm bảo có sẵn (mặc định Supabase):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Không cần thêm secret cho Expo Push API (public endpoint).

---

## PHẦN C — Không được phá

- **RLS** hiện có trên `quick_service_requests`, `residents`, `device_tokens`, v.v.
- RPC `activate_resident_with_code` (Life kích hoạt không qua edge function)
- Các handler khác: `auth-handler`, `building-handler`, …

---

## PHẦN D — Kiểm tra sau khi deploy

### Realtime (không cần push)

1. Mở 2 simulator/device: Life + Guard cùng building demo
2. Life tạo Grab → Guard màn **Hàng đợi** tự có dòng mới **không cần kéo refresh** (trong ~ vài giây)
3. Guard Accept → Life màn **Theo dõi Grab** đổi trạng thái tự động

### Push (cần device token + dev build Expo)

1. Đăng nhập Life và Guard trên **dev build** (không Expo Go), cho phép notification
2. Kiểm tra `SELECT * FROM device_tokens LIMIT 5` có token
3. Life gửi Grab → Guard nhận notification "Yêu cầu mới"
4. Guard Accept → Life nhận "Anh đã nhận việc"
5. Insert parcel cho resident demo → Life nhận "Bưu phẩm mới" (nếu đã setup webhook/cron phần A3)

### SQL kiểm tra publication

```sql
SELECT tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('quick_service_requests','support_requests','parcels','announcements');
```

---

## PHẦN E — Báo cáo khi xong

Trả lời ngắn:
1. Đã chạy SQL A1/A2 chưa, có lỗi gì không
2. Đã deploy functions nào (tên + version/date)
3. Webhook hay cron A3 đã cấu hình chưa
4. Kết quả test D (pass/fail từng mục)

Nếu không deploy được Edge Function trên Lovable, ghi rõ và đề xuất dùng Supabase CLI: `supabase functions deploy push-dispatcher` (và các handler đã đổi) với project ref hiện tại.
```

---

## Ghi chú cho bạn (không gửi Lovable)

- File code tham chiếu: `supabase/functions/_shared/push.ts`, `audit.ts`, `push-dispatcher/index.ts`
- Hướng dẫn FCM/APNs phía Expo: `docs/MOBILE_PUSH_SETUP.md` (Lovable **không** cần làm bước EAS)
- Project Supabase trong repo: `supabase/config.toml` → `project_id`
