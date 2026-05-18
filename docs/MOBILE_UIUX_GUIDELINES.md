# Hướng dẫn Thiết kế UI/UX Mobile
**Phiên bản:** 1.0  
**Đối tượng:** Developer & Designer  
**Ứng dụng:** Android (Material Design 3) & iOS (Human Interface Guidelines)

---

## 1. Nền tảng chung (Cross-Platform Foundation)

Để đảm bảo tính nhất quán và trải nghiệm mượt mà trên cả hai nền tảng, mọi thành phần thuộc bộ core phải tuân thủ các quy tắc sau:

### 1.1. Hệ thống Phông chữ (Typography)
*   **Font duy nhất:** Sử dụng **Be Vietnam Pro**.
*   **Triển khai:** Tích hợp qua `expo-font` để đảm bảo hiển thị đồng nhất.
*   **Accessibility:** Luôn hỗ trợ `Dynamic Type` (tự động điều chỉnh kích cỡ chữ theo cài đặt hệ thống của người dùng).
*   **Hierarchy:**
    *   *Display/Heading:* Bold, kích thước lớn cho tiêu đề trang.
    *   *Body:* Regular/Medium, line-height 1.5 để tối ưu khả năng đọc.

### 1.2. Vùng an toàn (Safe Area Context)
*   Sử dụng `SafeAreaView` từ `react-native-safe-area-context`.
*   **Mục tiêu:** Đảm bảo nội dung không bị che khuất bởi:
    *   **iOS:** Notch (tai thỏ), Dynamic Island, thanh Home Indicator.
    *   **Android:** Lỗ đục camera (punch-hole), thanh trạng thái (status bar).

### 1.3. Phản hồi xúc giác (Haptics)
*   Sử dụng `expo-haptics` để tăng cường cảm giác thực tế:
    *   **Thành công:** `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`.
    *   **Lỗi/Cảnh báo:** `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)`.
    *   **Chọn phần tử (Selection):** `Haptics.selectionAsync()`.

### 1.4. Hệ thống Màu sắc (Color System)
*   Tuân thủ tiêu chuẩn **WCAG 2.1 (AA)** về độ tương phản.
*   Hỗ trợ **Dark Mode** mặc định bằng cách sử dụng `Appearance` API để ánh xạ màu thương hiệu sang bảng màu tối tương ứng.

---

## 2. Quy tắc cho Android (Material Design 3 - M3)

Android đề cao tính hệ thống, sự phân cấp rõ ràng với các khối bo tròn lớn và linh hoạt.

### 2.1. Điều hướng và Bố cục
*   **Navigation Bar:** Luôn sử dụng thanh điều hướng phía dưới cùng (Bottom Navigation) thay vì các tab ở phía trên để dễ dàng thao tác bằng một tay.
*   **Floating Action Button (FAB):** 
    *   Đặt nút hành động chính (ví dụ: "Thêm văn bản") trong một nút nổi hình vuông bo góc lớn ở góc dưới bên phải.
    *   Sử dụng "Extended FAB" khi cần mô tả hành động bằng văn bản.
*   **Border Radius:** 
    *   Card: 12dp - 16dp.
    *   Dialog/Modal: 28dp (độ bo lớn là đặc trưng của M3).

### 2.2. Tương tác và Phản hồi
*   **Ripple Effect:** Bắt buộc áp dụng hiệu ứng nổi gợn sóng (Ripple) lan tỏa từ điểm chạm cho mọi thành phần có thể nhấn.
*   **Bottom Sheets:** Sử dụng bảng thông tin từ dưới lên khi cần lọc văn bản hoặc hiển thị menu chi tiết cho một item.
*   **Nút Back hệ thống:** Phải xử lý logic để người dùng có thể quay lại trang trước bằng phím cứng (Back button) hoặc cử chỉ vuốt từ mép màn hình.

---

## 3. Quy tắc cho iOS (Modern Human Interface Guidelines)

iOS tập trung vào sự tối giản, hiệu ứng mờ (translucency) và các cử chỉ điều hướng mượt mà.

### 3.1. Giao diện hiện đại (Modern iOS Look)
*   **Translucency & Blur:** Sử dụng hiệu ứng mờ đục (Vibrancy) cho Header và Tab Bar. Khi người dùng cuộn nội dung, Header nên từ trạng thái trong suốt chuyển sang mờ đục.
*   **Modal Presentation (Page Sheets):**
    *   Sử dụng dạng "Page Sheet" cho các màn hình phụ (ví dụ: chi tiết ký số).
    *   Đảm bảo có thanh chỉ dẫn (grabber) ở trên đầu để người dùng biết có thể vuốt xuống để đóng.
*   **SF Symbols:** Sử dụng bộ icon hệ thống SF Symbols 4+ để tạo cảm giác quen thuộc tuyệt đối với người dùng iOS.

### 3.2. Cử chỉ và Trải nghiệm
*   **Swipe to Back:** Bắt buộc hỗ trợ cử chỉ vuốt từ mép trái màn hình để quay lại (Edge swipe). Tránh bắt người dùng phải với tay lên tận nút "Back" trên Header.
*   **Context Menus:** Hỗ trợ nhấn giữ (Long press) vào một văn bản trong danh sách để hiện Preview nhanh và các hành động (Xem nhanh, Ký ngay, Xóa).
*   **Action Sheets:** Sử dụng Action Sheet chuẩn iOS khi cần chọn tệp đính kèm hoặc xác nhận hành động nguy hiểm (Xóa file).

---

## 4. Bảng so sánh Triển khai thực tế

| Thành phần | Android (Native Feel) | iOS (Native Feel) |
| :--- | :--- | :--- |
| **Tiêu đề (Header)** | Căn trái, kích thước lớn (Headline Large). | Thường căn giữa, chữ mảnh/sắc nét. |
| **Chọn Ngày/Giờ** | Dialog nổi giữa màn hình (Calendar picker). | Dạng bánh xe (Wheel) hoặc Inline cuộn. |
| **Thông báo (Alert)** | Nút căn phải, góc bo vừa phải (M3 style). | Nút căn giữa/xếp dọc, góc bo tròn lớn. |
| **Hiệu ứng nhấn** | Ripple lan tỏa (Material Ripple). | Giảm độ mờ (Active Opacity) khi chạm. |
| **Chuyển cảnh** | Sliding lên hoặc mở rộng từ FAB. | Trượt ngang từ phải sang (Horizontal push). |

---

## 5. Các tính năng Native 
### 5.1. Quản lý Tệp tin (Files)
*   Sử dụng `expo-document-picker`.
*   **iOS:** Phải hiển thị trình quản lý **Files** hệ thống.
*   **Android:** Hiển thị trình quản lý tệp tin mặc định (Storage Access Framework).

### 5.2. Accessibility & Performance (Bổ sung)
*   **Touch Targets:** 
    *   Android: Tối thiểu 48x48dp.
    *   iOS: Tối thiểu 44x44pt.
*   **Loading States:** Sử dụng **Skeleton Loaders** thay vì Activity Indicator xoay vòng cho danh sách văn bản để giảm cảm giác chờ đợi.
*   **Offline Support:** Hiển thị thanh thông báo nhỏ (Snack bar) khi mất kết nối internet nhưng vẫn cho phép đọc các văn bản đã cache.

### 5.3. Màu sắc thanh Menu Bar ở dưới 
Trên iOS/Android
Trên di động, hiệu ứng này rõ rệt hơn nhờ tận dụng engine của hệ điều hành:

iOS: Sử dụng UIBlurEffect. Màu nền thực chất là màu của lớp phủ (overlay) siêu mỏng, khoảng rgba(255, 255, 255, 0.5) cho Light mode và rgba(30, 30, 30, 0.5) cho Dark mode, nhưng độ mờ (blur radius) rất cao.

Android: Tùy thuộc vào phiên bản, nhưng thường là mã màu đặc (solid) nếu máy yếu, hoặc màu có kênh Alpha (độ trong suốt) nếu bật tính năng "Enable Animations".

---
> [!NOTE]
> Tài liệu này là kim chỉ nam cho mọi thay đổi giao diện trên ứng dụng. Mọi tính năng mới cần được đối soát với các quy tắc trên trước khi phê duyệt.
