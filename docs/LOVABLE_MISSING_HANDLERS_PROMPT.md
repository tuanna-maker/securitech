# Lovable — Thiếu guard-handler & life-handler (prompt bổ sung)

**Tình huống:** Repo trên Lovable không có `guard-handler` / `life-handler` → Guard app **không gọi được API** (queue, accept, điểm danh, quét QR). Push cho các event đó có thể tạm bằng SQL (bên dưới).

---

## Cách A — Nhanh: SQL push (không cần tạo handler)

Chạy trên Supabase SQL Editor:

**`supabase/scripts/MOBILE_REQUEST_PUSH_TRIGGERS.sql`**

→ Khi `app_status` đổi trên `quick_service_requests` / `support_requests`, tự insert `system_events` → webhook → `push-dispatcher`.

→ Khi `visitor_invites.status` = `checked_in` → push `guest_checked_in`.

**Điều kiện:** Đã có webhook `system_events` → `push-dispatcher` (như setup trước).

**Hạn chế:** Guard app vẫn **cần** `guard-handler` để accept/transition (trừ khi đổi app gọi API khác).

---

## Cách B — Đúng chuẩn: Tạo 2 Edge Function trên Lovable

Copy **nguyên thư mục** từ repo Git (sync project):

```
supabase/functions/guard-handler/index.ts   (~264 dòng)
supabase/functions/life-handler/index.ts    (~184 dòng)
```

Cần kèm shared (đã có):

- `_shared/mobile-auth.ts`
- `_shared/audit.ts` (đã có push)
- `_shared/cors.ts`, `_shared/errors.ts`

Deploy:

| Function | JWT verify |
|----------|------------|
| guard-handler | ON |
| life-handler | ON |

---

## PROMPT (dán Lovable)

```
Repo thiếu 2 Edge Function bắt buộc cho STOS Mobile. Hãy TẠO MỚI và DEPLOY:

1) supabase/functions/guard-handler/index.ts
   - GET ?action=queue&building_id=
   - POST action=attendance | accept | decline | transition | location-ping | checkin-visitor
   - Dùng authenticateGuard từ _shared/mobile-auth.ts
   - emitEvent: life_request_accepted, life_request_completed, life_request_status, guest_checked_in

2) supabase/functions/life-handler/index.ts
   - POST action=activate (hoặc bỏ nếu chỉ dùng RPC activate_resident_with_code)
   - POST cancel-request, rate, visitor-invite GET/POST
   - authenticateResident từ _shared/mobile-auth.ts

Nguồn: copy đầy đủ từ branch/repo securitech (folder supabase/functions/guard-handler và life-handler).

Sau deploy, chạy SQL: supabase/scripts/MOBILE_REQUEST_PUSH_TRIGGERS.sql (push dự phòng khi UPDATE app_status).

Xác nhận: curl/function test guard-handler?action=queue với JWT guard.
```

---

## App mobile đang gọi

| App | Function | Action |
|-----|----------|--------|
| Guard | **guard-handler** | queue, accept, transition, attendance, checkin-visitor |
| Guard | access-handler | walkin/checkout visitors |
| Guard | patrol-handler, finance-handler, service-handler | … |
| Life | **life-handler** | cancel-request, rate, visitor-invite |
| Life | service-handler | tạo Grab (quick) |
| Life | RPC | activate_resident_with_code |

**Ưu tiên:** Tạo `guard-handler` trước — không có thì Guard app hỏng queue/accept.

`life-handler` — Life vẫn login/Grab được (service-handler + RPC); thiếu thì hủy/rate/khách mời có thể lỗi.

---

## Checklist

- [ ] SQL `MOBILE_REQUEST_PUSH_TRIGGERS.sql`
- [ ] Webhook system_events → push-dispatcher
- [ ] Tạo + deploy **guard-handler**
- [ ] Tạo + deploy **life-handler** (khuyến nghị)
- [ ] Test: Guard accept → Life nhận push "Anh đã nhận việc"
