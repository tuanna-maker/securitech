# STOS Mobile Apps

| App | Path | User |
|-----|------|------|
| **STOS Life** | `stos-life/` | Cư dân |
| **STOS Guard** | `stos-guard/` | Bảo vệ |
| Command Center (existing) | `../mobile/` | Điều hành |

## Setup

1. Run SQL on Supabase: [`../supabase/scripts/STOS_MOBILE_FULL_SETUP.sql`](../supabase/scripts/STOS_MOBILE_FULL_SETUP.sql)
2. Deploy edge functions: `life-handler`, `guard-handler`
3. Copy `.env.example` → `.env` in each app (Supabase URL + anon key)
4. **Tài khoản test (chỉ SQL, không cần Dashboard):**
   - Life: [`SETUP_LIFE_TEST_ACCOUNT.sql`](../supabase/scripts/SETUP_LIFE_TEST_ACCOUNT.sql) → `life.demo@stos.local` / `StosLife@2026`
   - Guard: [`SETUP_GUARD_TEST_ACCOUNT.sql`](../supabase/scripts/SETUP_GUARD_TEST_ACCOUNT.sql) → `guard.demo@stos.local` / `StosGuard@2026`

```bash
cd apps/stos-life && nvm use 20 && npm install && npm start
cd apps/stos-guard && nvm use 20 && npm install && npm start
```

### Simulator — không thấy app cài?

`expo start --ios` chỉ mở **Expo Go** (app cam), không cài **STOS Life** riêng. Expo Go trên simulator thường **SDK 55** trong khi project **SDK 54** → không load được.

**Cách đúng — cài app native lên simulator:**

```bash
cd apps/stos-life
nvm use 20
npm run ios:install    # = expo run:ios, lần đầu ~5–15 phút
```

Sau đó mở icon **STOS Life** trên simulator; terminal khác chạy `npm start` để Metro.

Guard: `cd apps/stos-guard && npm run ios`

UI follows [`../docs/MOBILE_UIUX_GUIDELINES.md`](../docs/MOBILE_UIUX_GUIDELINES.md) and [`../docs/THEMES_MOBILE.md`](../docs/THEMES_MOBILE.md) (Apple HIG first).

Shared UI kit: [`../packages/mobile-shared/`](../packages/mobile-shared/)

## Demo seed

Run [`../supabase/scripts/SEED_MOBILE_DEMO.sql`](../supabase/scripts/SEED_MOBILE_DEMO.sql) — it picks your existing tenant/building/resident (or creates minimal demo rows). Check SQL Editor **Messages** for printed IDs and activation code `STOS-DEMO-2026`.

## E2E checklist (Life ↔ Guard)

1. Resident login + activate code `STOS-DEMO-2026`
2. Life Grab → Guard queue accept → `en_route` → `completed` → Life rate
3. Life SOS (hold 3s) → Guard accept/resolve
4. Life visitor invite QR → Guard scan check-in
5. Guard parcel receive → Life parcel list
6. Guard patrol route complete
7. Farm order cart → orders list
8. SLA: `SELECT expire_stale_life_requests();` → Life shows expired state

## Giao diện (THEMES_MOBILE)

- Navy `#1E3066` + Orange `#F58220`, gradient nút, hero banner, minh họa SVG đăng nhập
- Life: nút Grab gradient đỏ; Guard: lưới action màu theo chức năng

## Build trên Expo Cloud (EAS)

Đã link project **@tuanna-unicom/stos-life** — build trên server Expo, không phụ thuộc path máy có khoảng trắng.

Cần `eas login` (account `tuanna-unicom`). Biến Supabase đã set trên EAS environment `preview`.

```bash
cd apps/stos-life
nvm use 20

# Android APK (cài trực tiếp, không cần Xcode)
npm run build:cloud:android

# iOS Simulator (.app — tải về, kéo vào Simulator)
npm run build:cloud:ios-sim

# iOS thiết bị thật (cần Apple Developer)
npm run build:cloud:ios
```

Theo dõi build: https://expo.dev/accounts/tuanna-unicom/projects/stos-life/builds

Profile `preview` → **.apk** Android. `preview-simulator` → **.app** cho Simulator.

Build local (không cloud): `npm run build:apk:local` (cần Android SDK).

### STOS Guard

Chạy tương tự trong `apps/stos-guard` sau `eas init --force` và `eas env:create` (copy từ `.env`).

## Push notifications & realtime

- **Realtime (không reload):** sau khi chạy `MOBILE_REALTIME_PUBLICATION.sql`, Life/Guard tự cập nhật queue, home, parcels, Grab track qua Supabase Realtime.
- **Push:** `emitEvent` → Expo Push API → `device_tokens`. Cần FCM/APNs trên EAS — xem [docs/MOBILE_PUSH_SETUP.md](../docs/MOBILE_PUSH_SETUP.md).

SQL trên Lovable (thứ tự):

1. `STOS_MOBILE_FULL_SETUP.sql` (đã gồm publication mới)
2. `MOBILE_REALTIME_PUBLICATION.sql` (nếu setup cũ)
3. `MOBILE_PUSH_TRIGGERS.sql`
4. Deploy Edge Functions: `push-dispatcher`, cập nhật handlers dùng `_shared/push.ts`

## Regenerate types

```bash
supabase gen types typescript --project-id <id> > packages/mobile-shared/src/types/database.generated.ts
```
