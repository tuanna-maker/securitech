# STOS Guard — Ghi chú UI vs nghiệp vụ (SRS)

UI Guard được dựng theo **mockup dark ops** (`#0B121E`). Theme Guard **luôn dùng palette tối** (không phụ thuộc light/dark hệ thống). Dữ liệu demo: `apps/stos-guard/lib/mockGuardData.ts`.

## Đã có nghiệp vụ / API

| Màn | Route | Ghi chú |
|-----|-------|---------|
| Trang chủ | `(tabs)/index` | Profile, KPI queue |
| Vào / Kết thúc ca | `/attendance/index?mode=` | `guard-handler` attendance; checkout local state |
| Yêu cầu cư dân | `/queue/*` | `guard-handler` queue |
| Tuần tra | `/patrol/[routeId]` | `patrol-handler`; QR + ảnh |
| Báo sự cố | `/situation/new` | `service-handler` |
| Đón khách / QR | `/guests/*` | |
| Nhận đồ | `/parcels/receive` | |
| SOS | `/sos` | |
| Thông báo | `(tabs)/notifications` | `announcements` |
| Tài khoản | `(tabs)/account` | |

## UI mockup — demo / placeholder

| Thành phần | Trạng thái |
|------------|------------|
| Lịch trực (khi DB trống) | Demo `DEMO_SCHEDULE` |
| Tuần tra (điểm + giờ mẫu) | Demo `PATROL_CHECKPOINTS` |
| Bản đồ vòng tròn GPS | UI; không embed map thật |
| Checkout API riêng | Chỉ `setOnDuty(false)` local |
| Mở khóa / camera count 128 | Chưa tích hợp CC |

Nút chưa có API → `/coming-soon`.

## Tab bar (mockup)

Trang chủ · Lịch trực · Thông báo (badge) · Tài khoản

---

*Tham chiếu [STOS_GUARD_SRS.md](./STOS_GUARD_SRS.md).*
