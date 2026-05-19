# Gia đình tôi — phân tích UI vs dữ liệu

## Cố định (label / icon / layout)

| Vùng UI | Nguồn |
|---------|--------|
| Logo STOS Life + tagline "Vì cuộc sống an tâm" | `FamilyTabHeader` |
| Tiêu đề màn "Gia đình tôi" | Static |
| 4 quick action: nhãn + icon gradient | `lib/familyUiConfig.ts` → `FAMILY_QUICK_UI` |
| Tiêu đề section: QUẢN LÝ GIA ĐÌNH, DỊCH VỤ…, KHOẢNH KHẮC… | Static |
| Tiêu đề 4 thẻ quản lý (Chi tiêu, Đồng hành con, Tủ lạnh, Sức khỏe) | `family.tsx` → `MGMT_META` |
| Icon gradient trên thẻ | `LifeGradientIcon` (SVG) |
| Nhãn "AI gợi ý cho gia đình bạn" + robot | Static |
| Tab bar 5 tab | `_layout.tsx` |

## Động (database)

| Vùng UI | Bảng / logic |
|---------|----------------|
| Ảnh + tên gia đình + số thành viên + motto | `life_households` + đếm `life_household_members` |
| Badge chuông thông báo | `announcements` (theo `building_id`) |
| Avatar header phải | `profiles.avatar_url` hoặc `life_households.photo_url` |
| Chi tiêu tháng: tổng + % so tháng trước | `life_spending_months` |
| Bé + "X lịch hôm nay" | `life_household_members` (is_child) + `life_calendar_events` (event_date = hôm nay) |
| Cảnh báo tủ lạnh + ảnh thực phẩm | `life_fridge_items` (expiry ≤ 2 ngày) |
| Nhắc sức khỏe | `life_health_reminders` |
| Dịch vụ gia đình (nhãn có thể config theo tenant) | `life_family_service_catalog` |
| Album khoảnh khắc | `life_family_moments` |
| Chip AI gợi ý | Tổng hợp: lịch Piano hôm nay + hết hạn tủ lạnh + thuốc |

## API

- `GET life-handler?action=family-dashboard` — toàn màn
- `GET life-handler?action=family-spending&year=&month=` — màn chi tiêu

App: `hooks/useFamilyDashboard.ts`, `hooks/useFamilySpending.ts`

## Setup dữ liệu demo

```bash
# 1. Migration (Lovable hoặc supabase db push)
# 2. Đã có: STOS_MOBILE_FULL_SETUP.sql, SEED_MOBILE_DEMO.sql, SETUP_LIFE_TEST_ACCOUNT.sql
# 3. Seed gia đình:
psql ... -f supabase/scripts/SEED_LIFE_FAMILY_DEMO.sql
# 4. Deploy edge function life-handler (nếu dùng cloud)
```

Đăng nhập: `life.demo@stos.local` / `StosLife@2026`

## Fallback

Chưa đăng nhập hoặc API lỗi → `getFamilyDashboardFallback()` từ mock cũ (vẫn xem được UI).
