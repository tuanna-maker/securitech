# SRS — STOS Life (Ứng dụng Cư dân)
## Software Requirements Specification

| Thuộc tính | Giá trị |
|------------|---------|
| **Chuẩn tham chiếu** | ISO/IEC/IEEE 29148:2018, IEEE 830 (cấu trúc), Use Case (Cockburn) |
| **Phiên bản** | 1.0 |
| **Ngày** | 18/05/2026 |
| **Trạng thái** | Draft — sẵn sàng review kỹ thuật |
| **Sản phẩm** | STOS Life — Mobile (iOS / Android) |
| **Tài liệu nguồn** | [STOS_MOBILE_APPS_BRD.md](./STOS_MOBILE_APPS_BRD.md), [STOS_BRD.md](./STOS_BRD.md) |
| **Liên kết** | [STOS_GUARD_SRS.md](./STOS_GUARD_SRS.md), [STOS_MOBILE_TECHSPEC.md](./STOS_MOBILE_TECHSPEC.md) |

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Mô tả tổng quan](#2-mô-tả-tổng-quan)
3. [Yêu cầu phi chức năng chung](#3-yêu-cầu-phi-chức-năng-chung)
4. [Mô hình trạng thái nghiệp vụ](#4-mô-hình-trạng-thái-nghiệp-vụ)
5. [Danh mục Use Case](#5-danh-mục-use-case)
6. [Mẫu Use Case chuẩn](#6-mẫu-use-case-chuẩn)
7. [Đặc tả Use Case chi tiết](#7-đặc-tả-use-case-chi-tiết)
8. [Ma trận truy vết BRD](#8-ma-trận-truy-vết-brd)
9. [Phụ lục](#9-phụ-lục)

---

## 1. Giới thiệu

### 1.1. Mục đích

Tài liệu mô tả **yêu cầu phần mềm** cho ứng dụng **STOS Life** — cổng di động của cư dân trong hệ sinh thái STOS. SRS là cơ sở cho thiết kế kỹ thuật ([STOS_MOBILE_TECHSPEC.md](./STOS_MOBILE_TECHSPEC.md)), kiểm thử chấp nhận (UAT), và đào tạo vận hành.

### 1.2. Phạm vi

| Trong phạm vi | Ngoài phạm vi |
|---------------|---------------|
| Đăng nhập / kích hoạt cư dân theo căn hộ | Command Center (web) |
| Gọi anh bảo vệ (Grab nội khu) + theo dõi + đánh giá | STOS Guard (chi tiết xử lý — xem Guard SRS) |
| Đăng ký khách, QR, lịch sử ra vào | HR, CRM, tài chính doanh nghiệp |
| Bưu phẩm (xem, thông báo) | Triển khai hạ tầng / DevOps |
| Sự cố & hỗ trợ (ticket) | Farm Fresh thanh toán gateway (phase 2) |
| SOS cư dân | |
| Tiện ích hàng ngày | |
| Farm Fresh (catalog, đặt hàng) | |
| Cộng đồng & thông báo BQL | |
| Tài khoản, lịch sử, cài đặt | |

### 1.3. Định nghĩa & từ viết tắt

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| **Cư dân (Resident)** | Người dùng cuối đã gắn `residents` + căn hộ + tòa |
| **Yêu cầu Life** | Ticket do cư dân tạo — Guard xử lý qua hàng đợi |
| **Grab nội khu** | Luồng gọi anh: tạo → nhận → đến → hoàn thành → đánh giá |
| **SLA tiếp nhận** | Thời gian tối đa chờ bảo vệ nhận (mặc định 5 phút, cấu hình theo tòa) |
| **Escalation** | Chuyển Command Center khi quá SLA / tranh chấp |

### 1.4. Tài liệu tham chiếu

| ID | Tài liệu |
|----|----------|
| REF-01 | STOS_MOBILE_APPS_BRD.md §4 |
| REF-02 | STOS_BRD.md §7–8 (dịch vụ cư dân) |
| REF-03 | STOS_MOBILE_TECHSPEC.md (ánh xạ kỹ thuật) |

### 1.5. Tổng quan tài liệu

Cấu trúc tuân **ISO/IEC/IEEE 29148**: mô tả tổng quan → yêu cầu cụ thể (Use Case). Mỗi Use Case (UC) có **cùng bộ mục** (§6). Luồng tuần tự mô tả bằng **bảng chuẩn** gồm: Bước, Tác nhân, Hành động, Đầu vào, Validation, Đầu ra, Rẽ nhánh (If/Else), Mã lỗi.

---

## 2. Mô tả tổng quan

### 2.1. Bối cảnh sản phẩm

STOS Life là client di động kết nối **nền tảng STOS** (Supabase + Edge Functions). Cư dân tương tác với dữ liệu thuộc **một tenant** và **một tòa** đã đăng ký. Mọi yêu cầu “gọi anh” đồng bộ realtime tới **STOS Guard** và giám sát tại **Command Center**.

### 2.2. Lớp người dùng

| Lớp | Mô tả | Quyền trên Life |
|-----|--------|-----------------|
| **Cư dân đã kích hoạt** | `residents.user_id` = auth user | Toàn bộ UC trong phạm vi căn |
| **Cư dân chưa kích hoạt** | Có auth, chưa gắn căn | Chỉ UC kích hoạt, xem hướng dẫn |
| **Khách (Guest)** | Không dùng app | Tham gia gián tiếp qua QR (UC khách) |

### 2.3. Giả định & ràng buộc

| # | Giả định / Ràng buộc |
|---|----------------------|
| A-01 | Cư dân được BQL/Command Center tạo hồ sơ `residents` trước khi kích hoạt app |
| A-02 | Mỗi phiên đăng nhập gắn đúng một `resident_id` active |
| C-01 | BR-LIFE-01: Mọi thao tác ghi dữ liệu trong phạm vi `building_id` + `apartment` của resident |
| C-02 | BR-LIFE-03: Không hủy yêu cầu khi trạng thái ≥ `en_route` |
| C-03 | BR-LIFE-04: SOS / khẩn cấp ưu tiên hàng đợi Guard |
| C-04 | BR-LIFE-07: Farm Fresh tách timeline khỏi Grab |

### 2.4. Sáu nhóm dịch vụ (ánh xạ UC)

| Nhóm BRD | Use Case |
|----------|----------|
| Hỗ trợ anh bảo vệ | LIFE-UC-003 → 009 |
| Khách & Ra vào | LIFE-UC-010, 011, 025 |
| Bưu phẩm | LIFE-UC-012, 013 |
| Sự cố & Hỗ trợ | LIFE-UC-014 |
| Hỗ trợ hàng ngày | LIFE-UC-015 |
| Farm Fresh | LIFE-UC-017 → 019 |
| Cộng đồng | LIFE-UC-020, 021 |
| Nền tảng | LIFE-UC-001, 002, 016, 022 → 024, 026 |

---

## 3. Yêu cầu phi chức năng chung

| ID | Loại | Yêu cầu | Tiêu chí đo |
|----|------|---------|-------------|
| NFR-L-01 | Hiệu năng | Màn hình chính tải ≤ 2s (mạng 4G) | p95 |
| NFR-L-02 | Realtime | Cập nhật trạng thái yêu cầu ≤ 3s sau sự kiện Guard | Supabase Realtime |
| NFR-L-03 | Bảo mật | JWT Supabase; RLS theo tenant + resident | Pen-test checklist |
| NFR-L-04 | Khả dụng | UI tiếng Việt; hỗ trợ Dynamic Type (iOS) | WCAG 2.1 AA mục tiêu |
| NFR-L-05 | Thông báo | Push FCM/APNs cho 6 sự kiện BR-LIFE-06 | Delivery ≥ 95% |
| NFR-L-06 | Offline | Chỉ đọc cache lịch sử; không tạo yêu cầu offline MVP-1 | — |
| NFR-L-07 | Quyền riêng tư | Vị trí anh chỉ hiển thị khi yêu cầu ở trạng thái `en_route`/`on_site` | BR-LIFE |

---

## 4. Mô hình trạng thái nghiệp vụ

### 4.1. Yêu cầu “Gọi anh” (trạng thái cư dân nhìn thấy)

| Trạng thái app (`life_request_status`) | Ý nghĩa | Cho phép cư dân |
|----------------------------------------|---------|-----------------|
| `submitted` | Đã gửi, chờ nhận | Hủy |
| `accepted` | Anh X đã nhận | Gọi điện, xem profile anh |
| `en_route` | Đang đến, GPS bật | Theo dõi map; **không hủy** |
| `on_site` | Đã tới căn | Chờ hoàn thành |
| `completed` | Xong | Đánh giá |
| `cancelled` | Đã hủy sớm | — |
| `expired` | Quá SLA, chưa ai nhận | Gợi ý lễ tân / gọi lại |

### 4.2. SOS cư dân

| Trạng thái (`sos_status`) | Hiển thị Life |
|---------------------------|---------------|
| `pending` | "Đang kết nối anh hỗ trợ…" |
| `dispatched` | Tên anh + ETA (nếu có) |
| `resolved` | "Đã xử lý" + tóm tắt |
| `false_alarm` | "Đã hủy / nhầm" |

---

## 5. Danh mục Use Case

| ID | Tên | Ưu tiên | MVP |
|----|-----|---------|-----|
| LIFE-UC-001 | Đăng nhập & Kích hoạt tài khoản cư dân | Must | 1 |
| LIFE-UC-002 | Trang chủ & Shortcut dịch vụ | Must | 1 |
| LIFE-UC-003 | Khởi tạo yêu cầu Gọi anh (nút đỏ) | Must | 1 |
| LIFE-UC-004 | Chọn loại dịch vụ | Must | 1 |
| LIFE-UC-005 | Xác nhận & Gửi yêu cầu | Must | 1 |
| LIFE-UC-006 | Theo dõi trạng thái yêu cầu (không map) | Must | 1 |
| LIFE-UC-007 | Theo dõi bản đồ & ETA | Must | 2 |
| LIFE-UC-008 | Hủy yêu cầu (giai đoạn sớm) | Should | 1 |
| LIFE-UC-009 | Hoàn thành & Đánh giá dịch vụ | Must | 2 |
| LIFE-UC-010 | Đăng ký khách trước | Must | 2 |
| LIFE-UC-011 | Xem mã QR & Lịch sử khách | Must | 2 |
| LIFE-UC-012 | Danh sách bưu phẩm | Must | 3 |
| LIFE-UC-013 | Chi tiết bưu phẩm | Must | 3 |
| LIFE-UC-014 | Báo sự cố / Ticket hỗ trợ | Must | 2 |
| LIFE-UC-015 | Yêu cầu tiện ích hàng ngày | Should | 2 |
| LIFE-UC-016 | Kích hoạt SOS cư dân | Must | 1 |
| LIFE-UC-017 | Duyệt catalog Farm Fresh | Could | 4 |
| LIFE-UC-018 | Đặt hàng Farm Fresh | Could | 4 |
| LIFE-UC-019 | Lịch sử đơn Farm Fresh | Could | 4 |
| LIFE-UC-020 | Feed cộng đồng | Should | 3 |
| LIFE-UC-021 | Xem thông báo & Sự kiện BQL | Must | 3 |
| LIFE-UC-022 | Hồ sơ tài khoản & Căn hộ | Must | 1 |
| LIFE-UC-023 | Lịch sử yêu cầu | Must | 2 |
| LIFE-UC-024 | Cài đặt thông báo | Should | 2 |
| LIFE-UC-025 | Lịch sử ra vào (của hộ) | Should | 3 |
| LIFE-UC-026 | Xử lý quá SLA / Escalation (view) | Must | 2 |

---

## 6. Mẫu Use Case chuẩn

Mọi UC tại §7 **bắt buộc** có đủ các mục sau (để review đồng nhất):

1. **Định danh** — ID, tên, phiên bản, ưu tiên, MVP  
2. **Tác nhân** — Chính / Phụ / Hệ thống  
3. **Mô tả & Mục tiêu**  
4. **Tiền điều kiện (Preconditions)**  
5. **Hậu điều kiện** — Thành công / Thất bại  
6. **Kích hoạt & Tần suất**  
7. **Quy tắc nghiệp vụ liên quan**  
8. **Luồng chính (Main Flow)** — Bảng tuần tự  
9. **Luồng thay thế (Alternative Flows)**  
10. **Luồng ngoại lệ (Exception Flows)**  
11. **Sơ đồ trạng thái** (nếu có)  
12. **Từ điển dữ liệu (I/O)**  
13. **Yêu cầu giao diện**  
14. **Thông báo (Push/In-app)**  
15. **Yêu cầu phi chức năng riêng**  
16. **Truy vết BRD**

**Cột bảng luồng chuẩn:**

| Cột | Mô tả |
|-----|--------|
| **#** | Số bước |
| **Tác nhân** | Resident / Life App / API / Guard / CC |
| **Hành động** | Mô tả hành vi |
| **Đầu vào** | Payload, thao tác UI |
| **Validation** | Điều kiện hợp lệ |
| **Đầu ra** | Response, UI state |
| **Rẽ nhánh** | Điều kiện If → bước # |
| **Kết quả** | Success / Fail |
| **Mã lỗi** | `ERR_*` hoặc HTTP |

---

## 7. Đặc tả Use Case chi tiết

---

### LIFE-UC-001: Đăng nhập & Kích hoạt tài khoản cư dân

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-001 |
| **Tên** | Đăng nhập & Kích hoạt tài khoản cư dân |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Tác nhân chính** | Cư dân |
| **Tác nhân phụ** | Hệ thống Auth STOS, Command Center (kích hoạt hồ sơ) |
| **Mô tả tóm tắt** | Cư dân xác thực danh tính và liên kết tài khoản với hồ sơ `residents` / căn hộ. |
| **Mục tiêu** | Chỉ người đã gắn căn hợp lệ mới tạo yêu cầu dịch vụ. |

**Tiền điều kiện**

| # | Điều kiện |
|---|-----------|
| PRE-1 | App đã cài; có kết nối mạng |
| PRE-2 | BQL đã tạo hồ sơ cư dân trên nền tảng (email/SĐT khớp) |

**Hậu điều kiện — Thành công:** Session JWT hợp lệ; `resident_id`, `building_id`, `apartment` lưu local secure storage.  
**Hậu điều kiện — Thất bại:** Không lưu token; hiển thị hướng dẫn liên hệ BQL.

**Kích hoạt:** Mở app lần đầu hoặc session hết hạn.  
**Tần suất:** Mỗi phiên / ~30 ngày refresh token.

**Quy tắc nghiệp vụ:** BR-LIFE-01.

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Cư dân | Nhập email/SĐT + mật khẩu hoặc OTP | `identifier`, `secret` | Định dạng email/phone VN | — | — | — | — |
| 2 | Life App | Gọi Supabase Auth `signInWithPassword` / OTP | credentials | Auth OK | `session`, `user.id` | If fail → EXC-1 | — | ERR-AUTH-01 |
| 3 | Life App | `GET residents?user_id={uid}` | Bearer token | Có đúng 1 resident `status=active` | `resident` record | If 0 → ALT-1; If >1 → EXC-2 | Success | ERR-RES-01 |
| 4 | Life App | Lưu context; điều hướng Home | — | — | Màn LIFE-UC-002 | — | Success | — |

#### ALT-1: Chưa gắn căn hộ

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 3a | Life App | Hiển thị màn Kích hoạt | Mã kích hoạt (tuỳ chọn) | — | Form nhập mã / hotline BQL | — | — | — |
| 3b | Cư dân | Nhập mã BQL cấp | `activation_code` | Mã hợp lệ, chưa dùng | `resident` linked | If invalid → EXC-3 | Success/Fail | ERR-ACT-01 |

#### EXC-1: Sai mật khẩu

| # | Đầu ra | Mã lỗi | Hành vi |
|---|--------|--------|---------|
| E1 | Toast "Email hoặc mật khẩu không đúng" | ERR-AUTH-01 | Không lưu token; đếm sai ≤ 5 lần/15 phút |

#### Từ điển dữ liệu

| Field | Kiểu | Bắt buộc | Ghi chú |
|-------|------|----------|---------|
| `user_id` | UUID | Có | Supabase auth |
| `resident_id` | UUID | Có sau kích hoạt | FK `residents` |
| `building_id` | UUID | Có | Phạm vi dữ liệu |

#### UI

| Màn | Thành phần |
|-----|------------|
| Login | Email/phone, password, CTA Đăng nhập |
| Activation | Mã kích hoạt, hotline BQL |

#### Truy vết BRD

§4.2 persona; BR-LIFE-01.

---

### LIFE-UC-002: Trang chủ & Shortcut dịch vụ

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-002 |
| **Tên** | Trang chủ & Shortcut dịch vụ |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Tác nhân chính** | Cư dân |
| **Mô tả** | Hiển thị lời chào, thời tiết (tuỳ chọn), nút đỏ Gọi anh, shortcut Khách / Bưu phẩm / Sự cố / Ra vào. |
| **Mục tiêu** | Điểm vào < 2 thao tác tới killer feature. |

**Tiền điều kiện:** LIFE-UC-001 thành công.

**Hậu điều kiện — Thành công:** Dashboard render; badge thông báo chưa đọc (nếu có).

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Life App | Tải profile + yêu cầu đang active | `resident_id` | Session valid | Header tên, căn | — | Success | ERR-SES-01 |
| 2 | Life App | `GET` yêu cầu `status NOT IN (completed,cancelled)` | building_id | — | Banner trạng thái (nếu có) | If active request → tap mở UC-006/007 | Success | — |
| 3 | Cư dân | Chạm nút đỏ / shortcut | UI event | — | Navigate UC tương ứng | — | Success | — |

**Quy tắc:** BR-LIFE-06 (badge push).

#### Truy vết BRD

§4.4 Trang chủ.

---

### LIFE-UC-003: Khởi tạo yêu cầu Gọi anh (nút đỏ)

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-003 |
| **Tên** | Khởi tạo yêu cầu Gọi anh bảo vệ |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Tác nhân** | Cư dân; Life App; Guard (gián tiếp) |
| **Mô tả** | Cư dân chạm nút đỏ "Hỗ trợ anh bảo vệ" để bắt đầu luồng Grab. |
| **Mục tiêu** | Bắt đầu luồng có kiểm soát; chặn trùng yêu cầu. |

**Tiền điều kiện:** Đã đăng nhập; không có yêu cầu Grab đang `submitted|accepted|en_route|on_site`.

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Cư dân | Chạm nút đỏ | — | Session + resident | — | — | — | — |
| 2 | Life App | Kiểm tra yêu cầu đang mở | `resident_id` | Count active = 0 | — | If >0 → ALT-1 | — | ERR-REQ-02 |
| 3 | Life App | Kiểm tra tòa bật dịch vụ Life | `building_id` | Feature flag ON | — | If OFF → EXC-1 | Fail | ERR-BLD-01 |
| 4 | Life App | Điều hướng Chọn loại dịch vụ | — | — | LIFE-UC-004 | — | Success | — |

#### ALT-1: Đang có yêu cầu chưa xong

| # | Tác nhân | Hành động | Đầu ra | Rẽ nhánh |
|---|----------|-----------|--------|----------|
| 2a | Life App | Dialog "Bạn có yêu cầu đang xử lý" | Link tới UC-006 | Tiếp tục / Hủy |

#### EXC-1: Tòa chưa triển khai

| Mã | Thông báo |
|----|-----------|
| ERR-BLD-01 | "Tòa nhà chưa hỗ trợ STOS Life. Liên hệ BQL." |

**Quy tắc:** BR-LIFE-01, BR-LIFE-02.

#### Truy vết BRD

§4.5 bước ①; §4.8 sequence bước 1–2.

---

### LIFE-UC-004: Chọn loại dịch vụ

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-004 |
| **Tên** | Chọn loại dịch vụ |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Mô tả** | Danh sách icon: mở cửa, nhận hộ, kỹ thuật, xách đồ, khẩn cấp (không SOS), … |
| **Mục tiêu** | `service_type` rõ ràng cho hàng đợi Guard. |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Life App | Tải catalog từ cấu hình tòa | `building_id` | ≥1 loại active | Grid dịch vụ | If empty → EXC-1 | Fail | ERR-CFG-01 |
| 2 | Cư dân | Chọn 1 loại | `service_type` | Thuộc catalog | Highlight selection | — | — | — |
| 3 | Cư dân | (Tuỳ chọn) Chọn mức ưu tiên khẩn | `priority_hint` | Nếu loại = emergency → bắt buộc xác nhận | — | If emergency → nhắc SOS UC-016 | — | — |
| 4 | Life App | Navigate xác nhận | draft request | `service_type` required | LIFE-UC-005 | — | Success | ERR-VAL-01 |

#### Từ điển dữ liệu

| `service_type` (ví dụ) | Nhóm | Ưu tiên hàng đợi |
|------------------------|------|------------------|
| `open_door` | Hỗ trợ BV | normal |
| `receive_parcel` | Hỗ trợ BV | normal |
| `carry_items` | Tiện ích ngày | normal |
| `urgent_assist` | Khẩn | high (không thay SOS) |

**Quy tắc:** BR-LIFE-02, BR-LIFE-04.

---

### LIFE-UC-005: Xác nhận & Gửi yêu cầu

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-005 |
| **Tên** | Xác nhận & Gửi yêu cầu |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Mô tả** | Tóm tắt loại việc, căn hộ, ghi chú; gửi lên hàng đợi. |
| **Mục tiêu** | Tạo bản ghi `quick_service_requests` + push Guard. |

**Tiền điều kiện:** UC-004 đã chọn `service_type`.

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Life App | Hiển thị tóm tắt: loại, căn, tòa, ghi chú | draft | — | Màn xác nhận | — | — | — |
| 2 | Cư dân | Nhập ghi chú (optional) | `description` | max 1000 ký tự | — | — | — | — |
| 3 | Cư dân | Chạm "Gửi yêu cầu" | — | Network online | — | If offline → EXC-1 | Fail | ERR-NET-01 |
| 4 | Life App | `POST service-handler?type=quick` | body § TechSpec | API 201 | `request_id`, status=`submitted`* | — | Success | ERR-API-01 |
| 5 | Life App | Subscribe Realtime `quick_service_requests` | `request_id` | — | — | — | Success | — |
| 6 | Life App | Hiển thị "Đang tìm anh hỗ trợ…" | — | — | LIFE-UC-006 | — | Success | — |
| 7 | Hệ thống | Emit `life_request_created` → Guard queue | — | — | Push Guard | — | — | — |

\* Trạng thái app layer; DB `open` + metadata lifecycle — xem TechSpec §3.1.

#### ALT-1: SLA timer

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh |
|---|----------|-----------|------------|--------|----------|
| 8 | Hệ thống | Sau `sla_accept_seconds` chưa assign | No assignee | `expired` | → LIFE-UC-026 |

#### EXC-1: Lỗi mạng / server

| Mã | UI |
|----|-----|
| ERR-NET-01 | "Không có kết nối. Thử lại." + Retry |
| ERR-API-01 | "Không gửi được yêu cầu. Gọi lễ tân {hotline}." |

**Quy tắc:** BR-LIFE-02, BR-LIFE-06.

#### Truy vết BRD

§4.5 ③; §4.8 bước 3–7.

---

### LIFE-UC-006: Theo dõi trạng thái yêu cầu (không map)

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-006 |
| **Tên** | Theo dõi trạng thái yêu cầu |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Mô tả** | Màn trạng thái: submitted → accepted → on_site (MVP-1 không bản đồ). |
| **Mục tiêu** | Cư dân luôn biết tiến độ; nhận push. |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Life App | Poll/Realtime subscription | `request_id` | — | Current status | — | — | — |
| 2 | Hệ thống | Guard Accept | `assigned_to` | staff active | UI: tên + avatar anh | → accepted | Success | — |
| 3 | Life App | Push "Anh {name} đã nhận" | — | — | Notification | — | — | — |
| 4 | Hệ thống | Guard → en_route | GPS policy | — | If MVP-2 → UC-007; else text ETA | — | — | — |
| 5 | Hệ thống | Guard → on_site | — | — | "Anh đang hỗ trợ bạn" | — | — | — |
| 6 | Hệ thống | Guard → completed | — | — | Navigate UC-009 | — | Success | — |

#### ALT-1: Auto-complete (chính sách tòa)

| # | Điều kiện | Đầu ra |
|---|-----------|--------|
| 6a | Guard complete + cư dân không xác nhận trong `auto_complete_minutes` | `completed` + nhắc đánh giá |

**Quy tắc:** BR-LIFE-03, BR-LIFE-06.

---

### LIFE-UC-007: Theo dõi bản đồ & ETA

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-007 |
| **Tên** | Theo dõi bản đồ & ETA |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |
| **Mô tả** | Bản đồ hiển thị vị trí anh, ETA, nút gọi điện khi `en_route`. |
| **Mục tiêu** | Trải nghiệm Grab nội khu đầy đủ. |

**Tiền điều kiện:** Yêu cầu ở `en_route` hoặc `on_site`; Guard bật chia sẻ GPS.

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Life App | Subscribe `guard_location_pings` | `request_id` | Consent flag true | Map ready | If no GPS → ALT-1 | — | — |
| 2 | Life App | Render marker anh + căn hộ | lat/lng | Tọa độ trong bounding tòa | ETA tính từ OSRM/Haversine | — | Success | — |
| 3 | Life App | Cập nhật mỗi `ping_interval_sec` | stream | lat/lng hợp lệ | Marker move | — | — | — |
| 4 | Cư dân | Chạm "Gọi anh" | — | Phone guard có | `tel:` deep link | If null → EXC-1 | Fail | ERR-PHN-01 |
| 5 | Hệ thống | Guard → on_site | — | — | Ẩn ETA; giữ map tuỳ chính sách | — | Success | — |

#### ALT-1: GPS tạm mất

| # | Đầu ra |
|---|--------|
| 1a | Banner "Không cập nhật vị trí. Anh vẫn đang trên đường." |

**Quy tắc:** BR-LIFE-03 (không hủy).

#### Truy vết BRD

§4.5 ④; §4.8 loop theo dõi.

---

### LIFE-UC-008: Hủy yêu cầu (giai đoạn sớm)

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-008 |
| **Tên** | Hủy yêu cầu |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Should |
| **MVP** | 1 |
| **Mô tả** | Cư dân hủy khi trạng thái `submitted` hoặc `accepted` (chưa en_route). |
| **Mục tiêu** | Giải phóng hàng đợi Guard. |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|------------|--------|----------|-----|--------|
| 1 | Cư dân | Chạm Hủy + chọn lý do | status ∈ {submitted, accepted} | Dialog confirm | If en_route → EXC-1 | — | ERR-REQ-03 |
| 2 | Life App | `PATCH` cancel | `cancel_reason` required | status=cancelled | Notify Guard | Success | — |
| 3 | Life App | Về Home | — | — | — | Success | — |

#### EXC-1: Đang đến — không cho hủy

| Mã | Thông báo | Hành vi |
|----|-----------|---------|
| ERR-REQ-03 | "Anh đang trên đường. Vui lòng gọi điện hoặc liên hệ lễ tân." | CTA Gọi điện |

**Quy tắc:** BR-LIFE-03.

---

### LIFE-UC-009: Hoàn thành & Đánh giá dịch vụ

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-009 |
| **Tên** | Hoàn thành & Đánh giá |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |
| **Mô tả** | Sau `completed`, cư dân chấm 1–5 sao + góp ý. |
| **Mục tiêu** | Đóng vòng KPI; cảnh báo chất lượng nếu ≤2 sao. |

**Tiền điều kiện:** BR-LIFE-05 — status = `completed`; chưa có rating.

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Life App | Hiển thị màn đánh giá | guard info | — | UI stars | — | — | — |
| 2 | Cư dân | Chọn sao + comment | `stars` 1-5 | stars required | — | — | — | ERR-VAL-02 |
| 3 | Life App | `POST service-ratings` | request_id, stars | 201 | Thank you | If stars≤2 → event CC | Success | — |
| 4 | Hệ thống | Cộng KPI Guard | — | — | — | Else stars≥4 → KPI+ | Success | — |

#### ALT-1: Bỏ qua (nếu policy cho phép)

| # | Điều kiện | Đầu ra |
|---|-----------|--------|
| 2a | Sau 24h không đánh giá | Đóng modal; không gửi rating |

**Quy tắc:** BR-LIFE-05; BRD §4.8 đánh giá.

---

### LIFE-UC-010: Đăng ký khách trước

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-010 |
| **Tên** | Đăng ký khách trước |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |
| **Mô tả** | Cư dân đăng ký khách: tên, giờ đến/ra, biển số, mục đích. |
| **Mục tiêu** | Tạo lịch + QR cho Guard check-in. |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Cư dân | Mở form đăng ký khách | — | — | Empty form | — | — | — |
| 2 | Cư dân | Nhập thông tin | `visitor_name`, `visit_start`, `visit_end`, `vehicle_plate?`, `purpose?` | name≥2; start<end; start≥now | — | If invalid → EXC-1 | Fail | ERR-VAL-10 |
| 3 | Life App | `POST visitor-invites` | resident_id, building_id | 201 | `invite_id`, `qr_payload` | — | Success | ERR-API-10 |
| 4 | Life App | Hiển thị QR + mã số | — | — | LIFE-UC-011 | — | Success | — |

#### EXC-1: Thiếu thông tin

| Mã | Field lỗi hiển thị inline |

**Quy tắc:** BR-LIFE-01.

#### Truy vết BRD

§4.9 sequence đăng ký khách.

---

### LIFE-UC-011: Xem mã QR & Lịch sử khách

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-011 |
| **Tên** | Xem QR & Lịch sử khách |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |
| **Mô tả** | Xem QR active; lịch sử check-in/out; push khi khách vào/ra. |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh | KQ |
|---|----------|-----------|------------|--------|----------|-----|
| 1 | Life App | `GET visitor-invites` | resident scope | List grouped: upcoming/past | — | Success |
| 2 | Cư dân | Chọn invite | not expired | Full-screen QR | — | — |
| 3 | Hệ thống | Guard check-in event | — | Push "Khách đã vào" | — | — |
| 4 | Hệ thống | Guard check-out | — | Status completed | — | Success |

**Quy tắc:** BRD §4.9 alt mã hết hạn/sai tòa (hiển thị message nếu cư dân xem trạng thái failed).

---

### LIFE-UC-012: Danh sách bưu phẩm

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-012 |
| **Tên** | Danh sách bưu phẩm |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 3 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|------------|--------|----------|-----|--------|
| 1 | Life App | `GET access-handler?action=parcels&resident_id=` | JWT + RLS | Tabs: Chờ nhận / Đã nhận | — | Success | ERR-API-12 |
| 2 | Cư dân | Chọn item | — | UC-013 | — | — |
| 3 | Hệ thống | Guard ghi nhận parcel mới | — | Push "Có bưu phẩm" | — | — |

**Enum hiển thị:** `received`, `notified`, `picked_up`, `returned`.

**Quy tắc:** BR-LIFE-06.

---

### LIFE-UC-013: Chi tiết bưu phẩm

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-013 |
| **Tên** | Chi tiết bưu phẩm |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 3 |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu ra | Ghi chú |
|---|----------|-----------|--------|---------|
| 1 | Life App | `GET` parcel by id | Detail: sender, tracking, received_at, status | Read-only |
| 2 | Cư dân | Xem hướng dẫn lấy | Text lễ tân | Không đổi trạng thái trên Life |

---

### LIFE-UC-014: Báo sự cố / Ticket hỗ trợ

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-014 |
| **Tên** | Báo sự cố / Ticket |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |
| **Mô tả** | Báo kỹ thuật, điện nước, khẩn (không SOS). |
| **Mục tiêu** | Tạo `support_requests` có priority. |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Cư dân | Chọn loại sự cố | `category` | enum | Form | — | — | — |
| 2 | Cư dân | Nhập tiêu đề + mô tả | `title`, `description` | title 1-200; desc≤2000 | — | — | — | ERR-VAL-14 |
| 3 | Cư dân | Chọn mức ưu tiên | `priority` | high/medium/low | — | If "cháy/ngạt" → EXC-SOS | — | — |
| 4 | Life App | `POST service-handler?type=support` | body | 201 | ticket_id | — | Success | ERR-API-14 |
| 5 | Life App | Màn theo dõi ticket | — | Map `request_status` | open/in_progress/resolved | — | Success | — |

#### EXC-SOS: Dùng SOS thay ticket

| Điều kiện | Hành vi |
|-----------|---------|
| User chọn "Nguy hiểm tính mạng" | Redirect LIFE-UC-016 |

**Quy tắc:** BR-LIFE-04 (ticket khẩn < SOS).

---

### LIFE-UC-015: Yêu cầu tiện ích hàng ngày

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-015 |
| **Tên** | Tiện ích hàng ngày |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Should |
| **MVP** | 2 |
| **Mô tả** | Taxi, bơm lốp, xách đồ, mở cửa — có thể có phí. |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh |
|---|----------|-----------|------------|--------|----------|
| 1 | Cư dân | Chọn dịch vụ + giờ hẹn | `scheduled_at` ≥ now | draft | — |
| 2 | Life App | Hiển thị phí (nếu cấu hình) | — | Confirm | User cancel → end |
| 3 | Life App | `POST quick` với `scheduled_at`, `cost` | — | request_id | Giống UC-005 |

**Quy tắc:** BRD nhóm 5; có phí theo BQL.

---

### LIFE-UC-016: Kích hoạt SOS cư dân

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-016 |
| **Tên** | SOS cư dân |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Mô tả** | Giữ nút SOS ≥ 3s; gửi vị trí; ưu tiên tuyệt đối. |
| **Mục tiêu** | Golden time ≤ 3 phút dispatch. |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Cư dân | Giữ nút SOS 3s | hold timer | ≥3000ms | — | If release sớm → cancel | — | — |
| 2 | Life App | Lấy GPS + căn hộ | lat/lng | Permission granted | If denied → ALT-1 | — | ERR-GPS-01 |
| 3 | Life App | `POST sos-handler` | building_id, resident_id, lat, lng | 201 | sos_id, status | — | Success | ERR-SOS-01 |
| 4 | Hệ thống | Push all Guard + CC alert | — | — | — | — | — | — |
| 5 | Life App | Màn theo dõi SOS | realtime | dispatched/resolved | — | Success | — |
| 6 | Hệ thống | Guard accept | — | — | "Đã có anh hỗ trợ" | If timeout → CC manual | — | — |

#### ALT-1: Không có GPS

| # | Hành động | Đầu ra |
|---|-----------|--------|
| 2a | Cho nhập `location_description` + vẫn gửi SOS | SOS without coords |

**Quy tắc:** BR-LIFE-04; BRD §6.3.

---

### LIFE-UC-017: Duyệt catalog Farm Fresh

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-017 |
| **Tên** | Catalog Farm Fresh |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Could |
| **MVP** | 4 |
| **Mô tả** | Danh mục sản phẩm tươi theo tòa. |
| **Mục tiêu** | Doanh thu tách luồng Grab. |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra |
|---|----------|-----------|------------|--------|
| 1 | Life App | `GET farm-products?building_id` | catalog not empty | Grid sản phẩm |
| 2 | Cư dân | Thêm giỏ | stock > 0 | cart local |

**Quy tắc:** BR-LIFE-07.

---

### LIFE-UC-018: Đặt hàng Farm Fresh

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-018 |
| **Tên** | Đặt hàng Farm Fresh |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Could |
| **MVP** | 4 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh |
|---|----------|-----------|------------|--------|----------|
| 1 | Cư dân | Xác nhận giỏ + slot giao | items≥1; slot hợp lệ | — | — |
| 2 | Life App | `POST farm-orders` | payment_method (phase 2) | order_id | If payment fail → EXC-1 |
| 3 | Life App | Timeline đơn riêng | — | Không mix Grab | — |

---

### LIFE-UC-019: Lịch sử đơn Farm Fresh

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-019 |
| **Tên** | Lịch sử Farm Fresh |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Could |
| **MVP** | 4 |

#### Luồng chính: `GET farm-orders?resident_id` — read-only list + detail.

---

### LIFE-UC-020: Feed cộng đồng

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-020 |
| **Tên** | Feed cộng đồng |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Should |
| **MVP** | 3 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra |
|---|----------|-----------|------------|--------|
| 1 | Life App | `GET posts?building_id` | paginated | Feed |
| 2 | Cư dân | Xem chi tiết / like (optional) | — | — |

*BQL tạo nội dung qua Command Center — Life read-only MVP.*

---

### LIFE-UC-021: Thông báo & Sự kiện BQL

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-021 |
| **Tên** | Thông báo BQL |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 3 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra |
|---|----------|-----------|------------|--------|
| 1 | Life App | `GET announcements?building_id` | date order | List |
| 2 | Cư dân | Đọc chi tiết | mark read optional | Detail |
| 3 | Hệ thống | Push khi CC publish | — | Notification |

---

### LIFE-UC-022: Hồ sơ tài khoản & Căn hộ

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-022 |
| **Tên** | Hồ sơ & Căn hộ |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |

#### Luồng chính: Hiển thị `residents` + `buildings`; cho sửa phone/email (PATCH resident); SOS shortcut; đăng xuất.

---

### LIFE-UC-023: Lịch sử yêu cầu

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-023 |
| **Tên** | Lịch sử yêu cầu |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra |
|---|----------|-----------|------------|--------|
| 1 | Life App | `GET quick + support` merged | filter date/status | List |
| 2 | Cư dân | Xem chi tiết | — | Read-only detail + rating status |

---

### LIFE-UC-024: Cài đặt thông báo

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-024 |
| **Tên** | Cài đặt thông báo |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Should |
| **MVP** | 2 |

#### Luồng chính: Toggle 6 nhóm BR-LIFE-06; lưu `notification_preferences` (JSON); đăng ký FCM token.

---

### LIFE-UC-025: Lịch sử ra vào (hộ)

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-025 |
| **Tên** | Lịch sử ra vào |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Should |
| **MVP** | 3 |

#### Luồng chính: `GET access_logs` filter `host_resident` = apartment/name; hiển thị check-in/out.

---

### LIFE-UC-026: Quá SLA / Escalation (view)

| Mục | Nội dung |
|-----|----------|
| **ID** | LIFE-UC-026 |
| **Tên** | Quá SLA |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |
| **Mô tả** | Không ai nhận trong SLA — gợi ý gọi lễ tân / Command Center. |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh |
|---|----------|-----------|------------|--------|----------|
| 1 | Hệ thống | Job đánh dấu `expired` | no assignee | Event | — |
| 2 | Life App | UI "Chưa có anh nhận" | — | CTA gọi hotline + Gửi lại | Resubmit → UC-005 |
| 3 | CC | Gán thủ công Guard | — | Life realtime → accepted | — |

**Quy tắc:** BRD §4.7 trạng thái Quá hạn.

---

## 8. Ma trận truy vết BRD

| BRD (Mobile) | Use Case |
|--------------|----------|
| §4.3 Nhóm 1 Hỗ trợ BV | UC-003–009 |
| §4.3 Nhóm 2 Khách | UC-010, 011, 025 |
| §4.3 Nhóm 3 Bưu phẩm | UC-012, 013 |
| §4.3 Nhóm 4 Sự cố | UC-014 |
| §4.3 Nhóm 5 Tiện ích | UC-015 |
| §4.3 Nhóm 6 Farm Fresh | UC-017–019 |
| §4.3 Nhóm 7 Cộng đồng | UC-020, 021 |
| §4.6 Quy tắc BR-LIFE-01–07 | Rải trong UC |
| §4.8 Sequence Grab | UC-003–009, 026 |
| §4.9 Sequence Khách | UC-010, 011 |
| §6.3 SOS | UC-016 |

---

## 9. Phụ lục

### 9.1. Danh mục mã lỗi (Life)

| Mã | HTTP | Mô tả |
|----|------|--------|
| ERR-AUTH-01 | 401 | Đăng nhập thất bại |
| ERR-RES-01 | 404 | Không tìm thấy hồ sơ cư dân |
| ERR-REQ-02 | 409 | Đã có yêu cầu đang mở |
| ERR-REQ-03 | 403 | Không được hủy khi en_route |
| ERR-BLD-01 | 403 | Tòa chưa bật Life |
| ERR-NET-01 | — | Offline |
| ERR-SOS-01 | 500 | Không tạo được SOS |
| ERR-GPS-01 | — | Từ chối quyền vị trí |

### 9.2. Sự kiện Push (BR-LIFE-06)

| Sự kiện | Trigger |
|---------|---------|
| `life.request.accepted` | Guard nhận việc |
| `life.request.en_route` | Bắt đầu di chuyển |
| `life.request.completed` | Hoàn thành |
| `life.parcel.received` | Có bưu phẩm mới |
| `life.guest.checked_in` | Khách vào cổng |
| `life.sos.dispatched` | SOS có người nhận |

---

*Phiên bản tiếp theo: đồng bộ với [STOS_MOBILE_TECHSPEC.md](./STOS_MOBILE_TECHSPEC.md) khi API thay đổi.*
