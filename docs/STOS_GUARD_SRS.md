# SRS — STOS Guard (Ứng dụng Bảo vệ)
## Software Requirements Specification

| Thuộc tính | Giá trị |
|------------|---------|
| **Chuẩn tham chiếu** | ISO/IEC/IEEE 29148:2018, IEEE 830, Use Case (Cockburn) |
| **Phiên bản** | 1.0 |
| **Ngày** | 18/05/2026 |
| **Trạng thái** | Draft |
| **Sản phẩm** | STOS Guard — Mobile (iOS / Android) |
| **Tài liệu nguồn** | [STOS_MOBILE_APPS_BRD.md](./STOS_MOBILE_APPS_BRD.md), [STOS_BRD.md](./STOS_BRD.md) |
| **Liên kết** | [STOS_LIFE_SRS.md](./STOS_LIFE_SRS.md), [STOS_MOBILE_TECHSPEC.md](./STOS_MOBILE_TECHSPEC.md) |

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Mô tả tổng quan](#2-mô-tả-tổng-quan)
3. [Yêu cầu phi chức năng chung](#3-yêu-cầu-phi-chức-năng-chung)
4. [Mô hình trạng thái](#4-mô-hình-trạng-thái)
5. [Danh mục Use Case](#5-danh-mục-use-case)
6. [Mẫu Use Case chuẩn](#6-mẫu-use-case-chuẩn)
7. [Đặc tả Use Case chi tiết](#7-đặc-tả-use-case-chi-tiết)
8. [Ma trận truy vết BRD](#8-ma-trận-truy-vết-brd)
9. [Phụ lục](#9-phụ-lục)

---

## 1. Giới thiệu

### 1.1. Mục đích

Đặc tả yêu cầu phần mềm cho **STOS Guard** — công cụ hiện trường của nhân viên bảo vệ: ca trực, điểm danh, tuần tra, hàng đợi yêu cầu STOS Life, khách, hàng, SOS, KPI/lương (read-only).

### 1.2. Phạm vi

| Trong phạm vi | Ngoài phạm vi |
|---------------|---------------|
| Đăng nhập bảo vệ (`staff_members`) | Command Center web |
| Trang chủ 8 hành động | Cấu hình tòa / phân ca (CC) |
| Lịch ca, điểm danh GPS | Sửa bảng lương |
| Tuần tra checkpoint | CRM, HR đầy đủ |
| Hàng đợi & xử lý yêu cầu Life | STOS Life UI |
| Đón khách QR / walk-in | |
| Nhận & giao bưu phẩm | |
| SOS hiện trường + nhận SOS cư dân | |
| Báo tình huống | |
| Thông báo, tài khoản KPI | |

### 1.3. Định nghĩa

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| **Anh bảo vệ (Guard)** | `staff_members` có `user_id` auth |
| **Ca trực** | `shift_schedules` trong khung giờ hiện tại |
| **Điểm danh** | Xác nhận có mặt + GPS tại zone |
| **Yêu cầu Life** | `quick_service_requests` / `support_requests` từ cư dân |

### 1.4. Tham chiếu

REF-01 STOS_MOBILE_APPS_BRD.md §5; REF-02 STOS_BRD.md §8; REF-03 STOS_MOBILE_TECHSPEC.md.

---

## 2. Mô tả tổng quan

### 2.1. Bối cảnh

Guard app là client realtime phục vụ tòa được phân trong ca. Mọi thao tác ghi (trừ SOS khẩn) yêu cầu **đã điểm danh** (BR-GUARD-01).

### 2.2. Persona

| Persona | UC chính |
|---------|----------|
| Bảo vệ ca sáng/chiều/đêm | Điểm danh, tuần tra, nhận việc |
| Bảo vệ cổng | Khách, parcel |
| Bảo vệ tuần tra | Patrol |
| Trưởng ca (tuỳ chính sách) | Xem queue chưa nhận, hỗ trợ điều phối |

### 2.3. Ràng buộc nghiệp vụ

| Mã | Nội dung |
|----|----------|
| BR-GUARD-01 | Phải điểm danh trước thao tác (trừ SOS) |
| BR-GUARD-02 | Không bỏ checkpoint bắt buộc |
| BR-GUARD-03 | SOS giữ nút ≥ 3s + GPS |
| BR-GUARD-04 | Yêu cầu khẩn không từ chối nếu rảnh |
| BR-GUARD-05 | Tối đa N yêu cầu đồng thời (mặc định 1) |
| BR-GUARD-06 | Hoàn thành sự cố bắt buộc ghi chú |
| BR-GUARD-07 | QR khách khớp tòa + thời hạn |
| BR-GUARD-08 | Lương chỉ đọc |

### 2.4. Điều hướng (Tab)

| Tab | UC |
|-----|-----|
| Trang chủ | GUARD-UC-002 |
| Lịch | GUARD-UC-003 |
| Thông báo | GUARD-UC-021 |
| Tài khoản | GUARD-UC-022, 023 |

---

## 3. Yêu cầu phi chức năng chung

| ID | Yêu cầu | Tiêu chí |
|----|---------|----------|
| NFR-G-01 | Hoạt động mạng yếu | Queue thao tác patrol checkpoint offline-sync |
| NFR-G-02 | Pin & GPS | Chỉ bật GPS khi `en_route` |
| NFR-G-03 | Thời gian phản hồi push | ≤ 2s tới thiết bị |
| NFR-G-04 | Bảo mật | RLS tenant + staff scope |
| NFR-G-05 | SOS | Luôn available kể cả chưa điểm danh |
| NFR-G-06 | Usability | Thao tác 1 tay; nút lớn; contrast cao |

---

## 4. Mô hình trạng thái

### 4.1. Yêu cầu Life (phía Guard)

| Trạng thái | Hành động Guard |
|------------|-----------------|
| `new` | Nhận / Từ chối (có lý do) |
| `accepted` | Bắt đầu di chuyển → `en_route` |
| `en_route` | Cập nhật GPS; Đã tới → `on_site` |
| `on_site` | Hoàn thành |
| `completed` | Đóng |
| `escalated` | Chờ CC gán |

### 4.2. Ca & điểm danh

| Trạng thái Guard session | Ý nghĩa |
|--------------------------|---------|
| `off_duty` | Chưa điểm danh |
| `on_duty` | Đã điểm danh trong ca |
| `on_patrol` | Đang tuần tra (`staff.status`) |

---

## 5. Danh mục Use Case

| ID | Tên | Ưu tiên | MVP |
|----|-----|---------|-----|
| GUARD-UC-001 | Đăng nhập bảo vệ | Must | 1 |
| GUARD-UC-002 | Trang chủ — Lưới 8 hành động | Must | 1 |
| GUARD-UC-003 | Xem lịch ca tuần | Must | 1 |
| GUARD-UC-004 | Điểm danh ca (GPS) | Must | 1 |
| GUARD-UC-005 | Bắt đầu tuyến tuần tra | Must | 1 |
| GUARD-UC-006 | Hoàn thành checkpoint | Must | 1 |
| GUARD-UC-007 | Kết thúc tuần tra / Cảnh báo missed | Must | 1 |
| GUARD-UC-008 | Xem hàng đợi yêu cầu Life | Must | 1 |
| GUARD-UC-009 | Nhận yêu cầu Life | Must | 1 |
| GUARD-UC-010 | Từ chối / Bận yêu cầu | Must | 1 |
| GUARD-UC-011 | Cập nhật lifecycle yêu cầu | Must | 1 |
| GUARD-UC-012 | Chia sẻ GPS khi đang đến | Must | 2 |
| GUARD-UC-013 | Báo xử lý tình huống | Must | 2 |
| GUARD-UC-014 | SOS hiện trường (giữ 3s) | Must | 1 |
| GUARD-UC-015 | Nhận & xử lý SOS cư dân | Must | 1 |
| GUARD-UC-016 | Check-in khách (QR) | Must | 2 |
| GUARD-UC-017 | Check-out khách | Must | 2 |
| GUARD-UC-018 | Khách walk-in (không đăng ký) | Must | 2 |
| GUARD-UC-019 | Ghi nhận bưu phẩm đến | Must | 3 |
| GUARD-UC-020 | Cập nhật trạng thái bưu phẩm / Giao cư dân | Must | 3 |
| GUARD-UC-021 | Danh sách thông báo | Must | 2 |
| GUARD-UC-022 | Hồ sơ & Tòa đang trực | Must | 1 |
| GUARD-UC-023 | Xem lương & KPI (read-only) | Should | 3 |
| GUARD-UC-024 | Lịch sử đánh giá từ cư dân | Should | 2 |
| GUARD-UC-025 | Nhận escalation từ Command Center | Must | 2 |
| GUARD-UC-026 | Gọi cư dân từ chi tiết yêu cầu | Must | 2 |

---

## 6. Mẫu Use Case chuẩn

Cùng cấu trúc 16 mục như [STOS_LIFE_SRS.md §6](./STOS_LIFE_SRS.md#6-mẫu-use-case-chuẩn). Bảng luồng gồm: #, Tác nhân, Hành động, Đầu vào, Validation, Đầu ra, Rẽ nhánh, Kết quả, Mã lỗi.

---

## 7. Đặc tả Use Case chi tiết

---

### GUARD-UC-001: Đăng nhập bảo vệ

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-001 |
| **Tên** | Đăng nhập bảo vệ |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Tác nhân** | Bảo vệ; Hệ thống Auth |
| **Mô tả** | Xác thực và load `staff_members` + ca hôm nay. |
| **Mục tiêu** | Liên kết user ↔ nhân viên hiện trường. |

**Tiền điều kiện:** Tài khoản đã được admin gán `staff_members.user_id`.

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Bảo vệ | Đăng nhập | credentials | Auth OK | session | Fail → EXC-1 | — | ERR-AUTH-01 |
| 2 | Guard App | `GET staff by user_id` | — | Exactly 1 staff | staff_id, building_id | 0 → EXC-2 | Success | ERR-STF-01 |
| 3 | Guard App | `GET shift_schedules` today | staff_id | — | shifts[] | No shift → ALT-1 | — | — |
| 4 | Guard App | Lưu context; Home | — | — | UC-002 | — | Success | — |

#### EXC-2: Không phải nhân viên bảo vệ

| Mã | Thông báo |
|----|-----------|
| ERR-STF-01 | "Tài khoản không có quyền STOS Guard." |

---

### GUARD-UC-002: Trang chủ — Lưới 8 hành động

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-002 |
| **Tên** | Trang chủ |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Mô tả** | Header: tên, ca, tòa; 8 nút: Điểm danh, Tuần tra, Nhận yêu cầu, Xử lý tình huống, Đón khách, Nhận đồ, SOS, Thông báo. |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|------------|--------|----------|-----|--------|
| 1 | Guard App | Load staff + shift + duty flag | session | Header UI | — | Success | — |
| 2 | Guard App | Badge queue count | on_duty? | Số yêu cầu mới | — | — | — |
| 3 | Bảo vệ | Tap action | — | Navigate UC | If !on_duty && action≠SOS → EXC-1 | — | ERR-DUTY-01 |
| 4 | Guard App | Highlight ca hiện tại | time in shift window | — | — | — | — |

#### EXC-1: Chưa điểm danh

| Mã | Hành vi |
|----|---------|
| ERR-DUTY-01 | Dialog "Vui lòng điểm danh" → UC-004 |

**Quy tắc:** BR-GUARD-01.

---

### GUARD-UC-003: Xem lịch ca tuần

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-003 |
| **Tên** | Lịch ca tuần |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ |
|---|----------|-----------|---------|------------|--------|----------|-----|
| 1 | Guard App | `GET shift_schedules` week | staff_id, date range | — | Calendar UI | — | Success |
| 2 | Bảo vệ | Xem chi tiết ca | shift_id | — | Sáng 06-14 / Chiều 14-22 / Đêm 22-06 | — | — |

---

### GUARD-UC-004: Điểm danh ca (GPS)

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-004 |
| **Tên** | Điểm danh |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Mô tả** | Xác nhận giờ + vị trí tại cổng/zone. |
| **Mục tiêu** | `on_duty=true`; cập nhật `staff_members.last_check_in`. |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Bảo vệ | Chọn zone + Chấm công | `zone_id` | shift active now | — | No shift → EXC-1 | Fail | ERR-SHF-01 |
| 2 | Guard App | Lấy GPS | lat/lng | accuracy ≤ 50m | coords | Denied → EXC-2 | Fail | ERR-GPS-01 |
| 3 | Guard App | `POST guard-attendance` | staff_id, lat, lng, zone | distance(zone) ≤ radius | attendance_id | If far → EXC-3 | Fail | ERR-LOC-01 |
| 4 | Guard App | Set session on_duty | — | — | staff.status=stationary | — | Success | — |
| 5 | Guard App | Toast "Ca bắt đầu" | — | — | Home | — | Success | — |

#### EXC-3: Sai vị trí

| Mã | Thông báo |
|----|-----------|
| ERR-LOC-01 | "Bạn chưa ở đúng điểm điểm danh ({zone})." |

**Quy tắc:** BR-GUARD-01; BRD §5.9 sequence điểm danh.

---

### GUARD-UC-005: Bắt đầu tuyến tuần tra

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-005 |
| **Tên** | Bắt đầu tuần tra |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |

**Tiền điều kiện:** on_duty; có `patrol_routes` assigned `status=upcoming`.

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|------------|--------|----------|-----|--------|
| 1 | Bảo vệ | Chọn tuyến | route belongs staff+building | Route detail | — | — | — |
| 2 | Guard App | `PATCH patrol_routes` start | — | status=active, start_time=now | — | Success | ERR-PAT-01 |
| 3 | Guard App | `staff.status=on-patrol` | — | — | UC-006 | — | — |

---

### GUARD-UC-006: Hoàn thành checkpoint

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-006 |
| **Tên** | Tick / Quét checkpoint |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Bảo vệ | Tick hoặc quét QR checkpoint | `checkpoint_id` | thuộc route active | — | Wrong QR → EXC-1 | Fail | ERR-CP-01 |
| 2 | Guard App | `PATCH patrol_checkpoints` | completed=true | sequence OK (optional) | completion % | — | Success | — |
| 3 | Guard App | Cập nhật `patrol_routes.completion` | — | — | UI progress | All done → UC-007 | Success | — |

#### EXC-1: QR sai

| Mã | ERR-CP-01 | "Checkpoint không thuộc tuyến hiện tại." |

**Quy tắc:** BR-GUARD-02.

---

### GUARD-UC-007: Kết thúc tuần tra / Missed

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-007 |
| **Tên** | Kết thúc / Missed patrol |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |

#### Luồng chính — Hoàn thành 100%

| # | Tác nhân | Hành động | Validation | Đầu ra | KQ |
|---|----------|-----------|------------|--------|-----|
| 1 | Guard App | completion=100% | all required checkpoints | status=completed | Success |
| 2 | Guard App | staff.status=stationary | — | Toast OK | — |

#### ALT-1: Hết giờ chưa đủ 100%

| # | Tác nhân | Hành động | Đầu ra |
|---|----------|-----------|--------|
| 1a | Hệ thống | Job kiểm tra end_time | status=missed |
| 2a | Hệ thống | emit `patrol_violation` → CC | Alert |
| 3a | Guard App | Notification cảnh báo | — |

**Quy tắc:** BR-GUARD-02; BRD §5.9.

---

### GUARD-UC-008: Xem hàng đợi yêu cầu Life

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-008 |
| **Tên** | Hàng đợi yêu cầu |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Mô tả** | Danh sách realtime, sắp theo ưu tiên: SOS > khẩn > thường. |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh | KQ |
|---|----------|-----------|------------|--------|----------|-----|
| 1 | Guard App | Subscribe + `GET` queue | building_id, on_duty | Sorted list | Empty → empty state | Success |
| 2 | Bảo vệ | Mở chi tiết item | — | Detail screen | — | — |
| 3 | Hệ thống | Push yêu cầu mới | — | Sound + vibrate | — | — |

**Quy tắc:** BR-GUARD-04, BR-GUARD-05.

---

### GUARD-UC-009: Nhận yêu cầu Life

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-009 |
| **Tên** | Nhận yêu cầu |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Mô tả** | Accept → gán guard → Life thấy tên anh. |

**Tiền điều kiện:** on_duty; active_count < N.

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Bảo vệ | Tap "Nhận việc" | request_id | status=new; unassigned | — | If busy → UC-010 | — | ERR-REQ-05 |
| 2 | Guard App | `PATCH assign` | assigned_to=staff_id | optimistic lock | status=accepted | Race lost → EXC-1 | Fail | ERR-REQ-06 |
| 3 | Hệ thống | Notify Life | — | push accepted | — | Success | — |
| 4 | Guard App | Màn chi tiết yêu cầu | — | — | UC-011 | — | — |

#### EXC-1: Đã có người nhận

| Mã | ERR-REQ-06 | "Yêu cầu đã được anh khác nhận." |

**Quy tắc:** BRD §5.8 sequence.

---

### GUARD-UC-010: Từ chối / Bận

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-010 |
| **Tên** | Từ chối yêu cầu |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|------------|--------|----------|-----|--------|
| 1 | Bảo vệ | Chọn "Bận" + lý do | reason enum/text | reason required | — | If priority=critical → EXC-1 | Fail | ERR-REQ-07 |
| 2 | Guard App | `POST request-decline` | request_id, reason | — | requeue | — | Success | — |
| 3 | Hệ thống | Tìm guard khác / escalation | — | — | — | — | — |

#### EXC-1: Khẩn không được từ chối

| Mã | ERR-REQ-07 | "Yêu cầu khẩn cấp phải được xử lý." |

**Quy tắc:** BR-GUARD-04.

---

### GUARD-UC-011: Cập nhật lifecycle yêu cầu

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-011 |
| **Tên** | Cập nhật trạng thái yêu cầu |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Mô tả** | en_route → on_site → completed. |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Bảo vệ | "Bắt đầu đi" | request_id | status=accepted | en_route | → UC-012 | Success | — |
| 2 | Bảo vệ | "Đã tới" | — | assignee=self | on_site | — | Success | — |
| 3 | Bảo vệ | "Hoàn thành" + ghi chú | `completion_note` | If category=incident → note required | completed | Missing note → EXC-1 | Fail | ERR-REQ-08 |
| 4 | Hệ thống | Notify Life rating | — | — | — | Success | — |

#### EXC-1: Thiếu ghi chú sự cố

| Mã | ERR-REQ-08 |

**Quy tắc:** BR-GUARD-06; BRD §5.8.

---

### GUARD-UC-012: Chia sẻ GPS khi đang đến

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-012 |
| **Tên** | Chia sẻ GPS |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh |
|---|----------|-----------|------------|--------|----------|
| 1 | Guard App | Bật tracking khi en_route | consent | ping every 10s | — |
| 2 | Guard App | `INSERT guard_location_pings` | lat/lng, request_id | in building bounds | Life map update | — |
| 3 | Guard App | Tắt khi completed/on_site* | policy | stop pings | *config |

**Quy tắc:** BRD §5.5 chia sẻ vị trí.

---

### GUARD-UC-013: Báo xử lý tình huống

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-013 |
| **Tên** | Xử lý tình huống |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |
| **Mô tả** | Báo nhanh: xâm nhập, kỹ thuật, y tế, cháy, khác → `incidents`. |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ |
|---|----------|-----------|---------|------------|--------|----------|-----|
| 1 | Bảo vệ | Chọn loại + mô tả + ảnh? | type, description | on_duty | — | cháy → suggest SOS UC-014 | — |
| 2 | Guard App | `POST incident-handler` | building_id | 201 | incident_id | — | Success |
| 3 | Hệ thống | Alert CC nếu severity≥high | — | — | — | — |

---

### GUARD-UC-014: SOS hiện trường (giữ 3s)

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-014 |
| **Tên** | SOS bảo vệ |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |
| **Mô tả** | Nút đỏ giữ ≥3s; gửi GPS; **không** yêu cầu điểm danh. |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|------------|--------|----------|-----|--------|
| 1 | Bảo vệ | Giữ SOS 3s | timer≥3s | — | release early → abort | — | — |
| 2 | Guard App | GPS + `POST sos-handler` | staff as caller | 201 | sos_id | — | Success | ERR-SOS-01 |
| 3 | Hệ thống | Alert CC + peers | — | — | — | — | — |

**Quy tắc:** BR-GUARD-03; BR-GUARD-01 exception.

---

### GUARD-UC-015: Nhận & xử lý SOS cư dân

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-015 |
| **Tên** | Xử lý SOS cư dân |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh | KQ |
|---|----------|-----------|------------|--------|----------|-----|
| 1 | Guard App | Push SOS critical | — | Full-screen alert | — | — |
| 2 | Bảo vệ | Accept SOS | on_duty preferred | dispatched | If another accepted → EXC-1 | Fail |
| 3 | Bảo vệ | Cập nhật: đang đến → xử lý → đóng | status transitions | Life updated | false_alarm path | Success |
| 4 | Guard App | `PATCH sos-handler` | notes | resolved_at set | — | — |

**Quy tắc:** BRD §6.3; KPI SOS ≤ 3 phút.

---

### GUARD-UC-016: Check-in khách (QR)

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-016 |
| **Tên** | Check-in khách QR |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra | Rẽ nhánh | KQ | Mã lỗi |
|---|----------|-----------|---------|------------|--------|----------|-----|--------|
| 1 | Bảo vệ | Quét QR / nhập mã | `qr_payload` | invite valid; building match; now in window | guest info | Fail → EXC-1 | Fail | ERR-QR-01 |
| 2 | Guard App | `POST access-handler checkin` | invite_id | — | access_log_id | — | Success | — |
| 3 | Hệ thống | Notify Life | — | push checked_in | — | — | — |
| 4 | Bảo vệ | Cho khách vào | — | — | — | Success | — |

#### EXC-1: Mã hết hạn / sai tòa

| Mã | ERR-QR-01 | UI từ chối + hướng dẫn liên hệ cư dân |

**Quy tắc:** BR-GUARD-07; BRD §4.9.

---

### GUARD-UC-017: Check-out khách

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-017 |
| **Tên** | Check-out khách |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra |
|---|----------|-----------|------------|--------|
| 1 | Bảo vệ | Quét / chọn log đang trong | checked_out null | — |
| 2 | Guard App | `PATCH access_logs` checkout | — | checked_out_at=now |
| 3 | Hệ thống | Notify Life completed | — | push |

---

### GUARD-UC-018: Khách walk-in

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-018 |
| **Tên** | Khách không đăng ký |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |

#### Luồng chính

| # | Tác nhân | Hành động | Đầu vào | Validation | Đầu ra |
|---|----------|-----------|---------|------------|--------|
| 1 | Bảo vệ | Nhập tên, căn chủ, CMND? | visitor_name, host_apartment | on_duty | — |
| 2 | Guard App | `POST access_logs` type=guest | building_id | 201 | temp card optional |
| 3 | Bảo vệ | Check-out khi ra | — | UC-017 flow |

---

### GUARD-UC-019: Ghi nhận bưu phẩm đến

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-019 |
| **Tên** | Nhận bưu phẩm |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 3 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra |
|---|----------|-----------|------------|--------|
| 1 | Bảo vệ | Quét tracking / nhập căn | resident exists | form |
| 2 | Guard App | `POST access-handler?action=parcels` | — | status=received |
| 3 | Hệ thống | `emit parcel_received` → Life | — | push |

---

### GUARD-UC-020: Giao bưu phẩm cho cư dân

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-020 |
| **Tên** | Giao / Cập nhật bưu phẩm |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 3 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra |
|---|----------|-----------|------------|--------|
| 1 | Bảo vệ | Đánh dấu đã thông báo | — | status=notified |
| 2 | Bảo vệ | Xác nhận cư dân nhận | ID parcel | status=picked_up |
| 3 | Guard App | `PATCH parcels` | — | picked_up_at |

---

### GUARD-UC-021: Thông báo

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-021 |
| **Tên** | Thông báo |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |

#### Luồng chính: `GET announcements` + policy/reward notices; mark read; deep link tới queue/SOS.

---

### GUARD-UC-022: Hồ sơ & Tòa đang trực

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-022 |
| **Tên** | Hồ sơ |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 1 |

#### Luồng chính: Hiển thị mã NV, phòng ban, tòa, ca hiện tại; đăng xuất.

---

### GUARD-UC-023: Lương & KPI (read-only)

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-023 |
| **Tên** | Lương KPI |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Should |
| **MVP** | 3 |
| **Mô tả** | Lương cơ bản + thưởng − phạt = thực nhận; KPI Life + patrol. |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra | Rẽ nhánh |
|---|----------|-----------|------------|--------|----------|
| 1 | Guard App | `GET payroll` mapped via employee_id | read-only | UI breakdown | PATCH blocked → EXC-1 |
| 2 | Guard App | `GET kpi-summary` | staff_id | metrics | — | — |

**Quy tắc:** BR-GUARD-08.

#### EXC-1: Cố sửa

| Mã | ERR-PAY-01 | "Thông tin lương chỉ xem trên app." |

---

### GUARD-UC-024: Lịch sử đánh giá

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-024 |
| **Tên** | Đánh giá từ cư dân |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Should |
| **MVP** | 2 |

#### Luồng chính: `GET service-ratings?staff_id` — list stars + comments.

---

### GUARD-UC-025: Nhận escalation Command Center

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-025 |
| **Tên** | Escalation |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra |
|---|----------|-----------|------------|--------|
| 1 | CC | Gán request cho guard | assignee=me | push forced |
| 2 | Guard App | Hiển thị banner "Điều phối gán" | — | UC-011 |
| 3 | Bảo vệ | Không thể từ chối nếu policy escalation | — | must accept |

---

### GUARD-UC-026: Gọi cư dân

| Mục | Nội dung |
|-----|----------|
| **ID** | GUARD-UC-026 |
| **Tên** | Gọi cư dân |
| **Phiên bản** | 1.0 |
| **Độ ưu tiên** | Must |
| **MVP** | 2 |

#### Luồng chính

| # | Tác nhân | Hành động | Validation | Đầu ra |
|---|----------|-----------|------------|--------|
| 1 | Bảo vệ | Tap gọi trên chi tiết yêu cầu | phone not null | `tel:` resident.phone |
| 2 | Guard App | Log `contact_attempt` (audit) | — | — |

---

## 8. Ma trận truy vết BRD

| BRD Guard | Use Case |
|-----------|----------|
| §5.3 Màn 1–11 | UC-002, 003–007, 008–020, 021–023 |
| §5.5 Phục vụ Life | UC-008–012, 025, 026 |
| §5.6 BR-GUARD-01–08 | Rải trong UC |
| §5.8 Sequence nhận Life | UC-009–011 |
| §5.9 Điểm danh + Tuần tra | UC-004–007 |
| §6.3 SOS cư dân | UC-015 |
| §6.2 Ma trận tính năng | Toàn bộ |

---

## 9. Phụ lục

### 9.1. Mã lỗi Guard

| Mã | Mô tả |
|----|--------|
| ERR-DUTY-01 | Chưa điểm danh |
| ERR-LOC-01 | Sai vị trí điểm danh |
| ERR-REQ-05 | Đạt giới hạn yêu cầu đồng thời |
| ERR-REQ-06 | Race khi nhận việc |
| ERR-REQ-07 | Từ chối yêu cầu khẩn |
| ERR-REQ-08 | Thiếu ghi chú hoàn thành |
| ERR-QR-01 | QR khách không hợp lệ |
| ERR-PAY-01 | Không cho sửa lương |

### 9.2. Sự kiện Push Guard

| Sự kiện | Hành động |
|---------|-----------|
| `guard.queue.new` | Yêu cầu Life mới |
| `guard.sos.triggered` | SOS cư dân / đồng nghiệp |
| `guard.patrol.missed` | Tuần tra missed |
| `guard.shift.reminder` | Nhắc ca |
| `guard.escalation.assigned` | CC gán việc |

---

*Đồng bộ kỹ thuật: [STOS_MOBILE_TECHSPEC.md](./STOS_MOBILE_TECHSPEC.md)*
