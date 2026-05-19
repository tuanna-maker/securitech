# Lovable — Tạo Edge Functions STOS Mobile (file + prompt)

**Cách dùng:** Đẩy/sync repo lên Lovable (hoặc copy thư mục `supabase/functions/`). Dán **PROMPT** bên dưới vào chat Lovable. File code đã có sẵn trong repo — Lovable chỉ cần **tạo đúng path + deploy Supabase**.

---

## PROMPT (copy toàn bộ khối này vào Lovable)

```
Nhiệm vụ: Thêm và deploy Supabase Edge Functions cho STOS Life + STOS Guard (push notification + realtime backend). Code đã có trong repo — hãy đảm bảo các file sau TỒN TẠI đúng đường dẫn, deploy lên Supabase project hiện tại, và chạy SQL.

## 1. Tạo / cập nhật file (bắt buộc)

### File MỚI

**A) `supabase/functions/_shared/push.ts`**
- Export `dispatchPushForEvent(supabase, tenantId, eventType, payload)`
- Gửi Expo Push: POST https://exp.host/--/api/v2/push/send
- Đọc token từ bảng `device_tokens` (app_role: life | guard)
- Map event → title/body/data.url (deep link trong app)

**B) `supabase/functions/push-dispatcher/index.ts`**
- POST: body `{ event_type, tenant_id, payload }` → gọi dispatchPushForEvent
- GET: xử lý backlog `system_events` where is_processed = false
- Dùng SUPABASE_SERVICE_ROLE_KEY
- Deploy với **Verify JWT = OFF** (--no-verify-jwt) vì webhook/cron gọi bằng service role

### File SỬA

**C) `supabase/functions/_shared/audit.ts`**
- Trong `emitEvent()`: TRƯỚC khi insert system_events, gọi `await dispatchPushForEvent(...)` từ `./push.ts`
- Insert system_events với `is_processed: true`

**D) `supabase/functions/guard-handler/index.ts`**
- Trong action `transition`, sau khi update thành công:
  - Nếu to === "completed" → emitEvent "life_request_completed"
  - Nếu to ∈ ["en_route","on_site","expired"] → emitEvent "life_request_status" với payload { request_id, to_status, building_id: ctx.buildingId }

### File KHÔNG sửa logic (chỉ cần REDEPLOY sau khi audit.ts đổi)

- `service-handler` — đã emit `life_request_created` / `support_request_created`
- `sos-handler` — đã emit `sos_triggered`
- `life-handler`, `guard-handler` (phần accept đã emit `life_request_accepted`)

## 2. SQL (Supabase SQL Editor)

Chạy lần lượt (idempotent):

1. `supabase/scripts/MOBILE_REALTIME_PUBLICATION.sql`
2. `supabase/scripts/MOBILE_PUSH_TRIGGERS.sql`

(Bảng `device_tokens`, `system_events` phải đã có từ STOS_MOBILE_FULL_SETUP.sql)

## 3. Database Webhook (cho push từ trigger SQL)

Table: `system_events`, Event: INSERT, filter: is_processed = false

POST → `https://<PROJECT_REF>.supabase.co/functions/v1/push-dispatcher`

Header: `Authorization: Bearer <SERVICE_ROLE_KEY>`

Body JSON:
{
  "event_type": "{{ record.event_type }}",
  "tenant_id": "{{ record.tenant_id }}",
  "payload": {{ record.payload }}
}

## 4. Deploy Edge Functions trên Supabase (qua Lovable)

Deploy các function sau (JWT verify ON, trừ push-dispatcher OFF):

| Function | Verify JWT |
|----------|------------|
| push-dispatcher | **OFF** |
| guard-handler | ON |
| service-handler | ON |
| sos-handler | ON |
| life-handler | ON |

## 5. Event types push đã implement

- life_request_created, support_request_created → Guard
- life_request_accepted, life_request_completed, life_request_status → Life resident
- sos_triggered → Guard
- parcel_received, parcel_status_changed → Life (từ SQL trigger + webhook)
- announcement_published → Guard
- guest_checked_in → Life

## 6. Kiểm tra

- Dashboard → Edge Functions thấy `push-dispatcher`
- Life tạo Grab → Guard nhận push (cần row trong device_tokens)
- INSERT parcel → system_events → webhook → push Life

Báo cáo: danh sách file đã tạo/sửa, deploy status từng function, SQL đã chạy chưa, webhook đã tạo chưa.
```

---

## Danh sách file trong repo (đối chiếu)

| Trạng thái | Đường dẫn |
|------------|-----------|
| **MỚI** | `supabase/functions/_shared/push.ts` |
| **MỚI** | `supabase/functions/push-dispatcher/index.ts` |
| **SỬA** | `supabase/functions/_shared/audit.ts` |
| **SỬA** | `supabase/functions/guard-handler/index.ts` (block `transition`) |
| SQL | `supabase/scripts/MOBILE_REALTIME_PUBLICATION.sql` |
| SQL | `supabase/scripts/MOBILE_PUSH_TRIGGERS.sql` |

Nếu Lovable không thấy file: copy nội dung từ **Phụ lục** cuối file này.

---

## Phụ lục — Nội dung file (dán nếu repo chưa sync)

### `supabase/functions/_shared/audit.ts` (thay toàn file)

```typescript
import type { AuthContext } from "./auth.ts";
import { dispatchPushForEvent } from "./push.ts";

export async function writeAuditLog(
  ctx: AuthContext,
  action: string,
  entityType: string,
  entityId?: string,
  oldData?: unknown,
  newData?: unknown
) {
  await ctx.supabase.from("audit_logs").insert({
    tenant_id: ctx.tenantId,
    user_id: ctx.user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_data: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
    new_data: newData ? JSON.parse(JSON.stringify(newData)) : null,
  });
}

export async function emitEvent(
  ctx: AuthContext,
  eventType: string,
  payload: Record<string, unknown>
) {
  await dispatchPushForEvent(ctx.supabase, ctx.tenantId, eventType, payload);

  await ctx.supabase.from("system_events").insert({
    tenant_id: ctx.tenantId,
    event_type: eventType,
    payload,
    is_processed: true,
  });
}
```

### `supabase/functions/push-dispatcher/index.ts`

→ Copy nguyên file từ repo: `supabase/functions/push-dispatcher/index.ts` (48 dòng).

### `supabase/functions/_shared/push.ts`

→ Copy nguyên file từ repo: `supabase/functions/_shared/push.ts` (190 dòng).

### `guard-handler` — đoạn thêm trong `transition` (sau `if (error) throw error;`)

```typescript
      if (to === "completed") {
        await emitEvent(ctx, "life_request_completed", { request_id: body.request_id });
      } else if (["en_route", "on_site", "expired"].includes(to)) {
        await emitEvent(ctx, "life_request_status", {
          request_id: body.request_id,
          to_status: to,
          building_id: ctx.buildingId,
        });
      }
```

---

## Tài liệu liên quan

- SQL + webhook chi tiết: `docs/LOVABLE_MOBILE_BACKEND_PROMPT.md`
- Push phía Expo/EAS: `docs/MOBILE_PUSH_SETUP.md`
