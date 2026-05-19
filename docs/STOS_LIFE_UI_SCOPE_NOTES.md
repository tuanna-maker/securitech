# STOS Life — Ghi chú UI vs nghiệp vụ (SRS)

Tài liệu này liệt kê **các phần giao diện đã dựng theo mockup** nhưng **chưa có (hoặc chưa đủ) nghiệp vụ/backend** trong phạm vi [STOS_LIFE_SRS.md](./STOS_LIFE_SRS.md). UI hiện dùng **dữ liệu demo** (`apps/stos-life/lib/mockLifeData.ts`).

## Đã có nghiệp vụ + API (gắn thật khi test)

| Màn / luồng | Tab / route | Ghi chú |
|-------------|-------------|---------|
| Trang chủ, gọi Grab | `(tabs)/index` | `quick_service_requests`, Grab flow |
| Dịch vụ bảo an (cơ bản) | `(tabs)/security` | Grab, SOS, khách, sự cố, cộng đồng |
| Khách & QR | `/guests/*` | `visitor_invites` |
| Bưu phẩm | `/parcels` | `parcels` |
| SOS | `/sos` | Ưu tiên hàng đợi Guard |
| Sự cố | `/incidents/new` | Ticket hỗ trợ |
| Farm Fresh | `/farm/*` | Catalog / đặt hàng (phase 1) |
| Cộng đồng / BQL | `/community-feed` | `announcements` |
| Lịch sử yêu cầu | `(tabs)/history` (ẩn tab, mở từ link) | Lịch sử Grab / ticket |
| Tài khoản | `(tabs)/account` | Profile resident |

## UI mockup — chưa có nghiệp vụ đầy đủ (demo / placeholder)

### Tab **Gia đình tôi** `(tabs)/family`

| Thành phần UI | Trạng thái backend | Ghi chú |
|---------------|-------------------|---------|
| Hồ sơ gia đình (tên, số thành viên, motto) | ❌ | Chưa có bảng `families` / household |
| Thành viên, Lịch gia đình, Kỷ niệm, Cài đặt | ❌ | Nút chưa mở màn chi tiết |
| Chi tiêu gia đình (tổng, %) | ❌ | Xem `family/spending` — demo |
| Đồng hành cùng con (lịch trẻ) | ❌ | Không trong SRS Life |
| Thực phẩm & Tủ lạnh (hết hạn) | ❌ | Không trong SRS |
| Sức khỏe gia đình (nhắc thuốc trên card) | ⚠️ | Trùng concept tab Sức khỏe — chưa API |
| Dịch vụ gia đình (du lịch, xe, mua sắm hộ, gói VIP) | ❌ | Đối tác / OTA — ngoài phạm vi |
| Khoảnh khắc gia đình (album ảnh) | ❌ | Storage + album — ngoài phạm vi |
| Thanh AI gợi ý gia đình | ❌ | Cần engine gợi ý + calendar |

### Màn **Chi tiêu gia đình** `family/spending`

| Thành phần | Trạng thái |
|------------|------------|
| Tổng chi, biểu đồ nhóm, ngân sách | ❌ Demo |
| AI Insight chi tiêu | ❌ |
| Nhóm chi tiêu 8 danh mục | ❌ |
| Giao dịch gần đây | ❌ |
| Chụp hóa đơn (OCR) | ❌ |
| Thêm chi tiêu / báo cáo / ngân sách / chia sẻ | ❌ |

### Tab **Sức khỏe** `(tabs)/health`

| Thành phần | Trạng thái |
|------------|------------|
| Chọn thành viên / thêm người | ❌ |
| Chỉ số (nhịp tim, ngủ, bước, năng lượng) | ❌ Không wearable sync |
| Đặt lịch khám, tư vấn bác sĩ, bảo hiểm | ❌ |
| Nhắc uống thuốc | ❌ |
| Hồ sơ (xét nghiệm, đơn, tiêm, dị ứng, bệnh sử) | ❌ |
| AI Health Insight | ❌ |
| Hoạt động gần đây | ❌ |

### Tab **Dịch vụ bảo an** `(tabs)/security` — phần vượt SRS

| Thành phần | Trạng thái |
|------------|------------|
| Số camera hoạt động, nhân viên trực 24/24 | ❌ Demo — cần tích hợp CC / IoT |
| Mở khóa từ xa | ❌ Cần access control |
| Chat trực tuyến bảo an | ⚠️ Có thể map Grab/message — chưa chat riêng |
| Hoạt động an ninh (log) | ⚠️ Một phần qua `system_events` / announcements |

## Cấu trúc tab (theo mockup)

| Tab | File |
|-----|------|
| Trang chủ | `(tabs)/index` |
| Gia đình tôi | `(tabs)/family` |
| Dịch vụ bảo an | `(tabs)/security` |
| Sức khỏe | `(tabs)/health` |
| Tài khoản | `(tabs)/account` |

Tab **Cộng đồng** không nằm trên bottom bar; mở qua chuông thông báo hoặc “Nhóm cộng đồng” → `/community-feed`.

## Ưu tiên tích hợp backend (gợi ý)

1. **P0** — Giữ Grab, SOS, khách, bưu phẩm, sự cố, announcements (đã có trong SRS).
2. **P1** — Lịch sử hoạt động an ninh thật từ `system_events` / audit.
3. **P2** — Hộ gia đình tối thiểu (tên, thành viên link `residents`).
4. **Backlog** — Chi tiêu, sức khỏe, album, dịch vụ đối tác (phase sản phẩm riêng).

---

*Cập nhật khi triển khai API — file tham chiếu cho PM/Dev, không thay SRS.*
