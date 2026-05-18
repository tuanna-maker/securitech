🎨 BẢNG QUY ĐỊNH HỆ THỐNG MÀU SẮC (UI/UX STYLE GUIDE)1. Bảng màu cốt lõi (Core Palette)Đây là các biến màu cố định (Constant) được dùng để ánh xạ (mapping) sang các chế độ hiển thị.LoạiTên biếnMã HexÝ nghĩaPrimaryBrand-Navy#1E3066Màu thương hiệu chính, đại diện cho sự tin cậy.SecondaryBrand-Orange#F58220Màu hành động (CTA), tạo sự nổi bật.SuccessSemantic-Green#22C55ETrạng thái hoàn thành, an toàn.WarningSemantic-Yellow#FACC15Trạng thái chờ, lưu ý.ErrorSemantic-Red#EF4444Trạng thái lỗi, dừng lại.2. Quy tắc ánh xạ (Theme Mapping)Sử dụng các tên biến theo chức năng (Functional naming) để khi bạn code React Native, việc switch mode chỉ là thay đổi giá trị của biến.A. Background & Surface (Nền và Khối)Thành phầnLight ModeDark ModeGhi chúbg-primary#F8F9FA#0F172ANền toàn màn hình.bg-surface#FFFFFF#1E293BNền các thẻ (Card), Bottom Sheet.border-color#E2E8F0#334155Đường kẻ phân cách, viền Input.B. Typography (Hệ thống chữ)Thành phầnLight ModeDark ModeGhi chútext-main#1A1A1A#F1F5F9Tiêu đề, văn bản quan trọng nhất.text-sub#64748B#94A3B8Nội dung mô tả, caption, thời gian.text-on-prm#FFFFFF#FFFFFFChữ hiển thị trên nền Navy hoặc Cam.3. Quy tắc áp dụng cho iOS & AndroidMặc dù dùng chung bộ màu, nhưng cách áp dụng cần tuân thủ đặc thù của từng hệ điều hành:iOS (Human Interface Guidelines):Blur & Transparency: Tận dụng hiệu ứng Frosted Glass (mờ đục). Ví dụ: Navigation Bar dùng màu bg-surface với độ nhòe (Blur) thay vì đổ màu đặc.System Blue: Dùng màu xanh chuẩn của iOS cho các nút "Hủy" hoặc "Quay lại" nếu không bắt buộc dùng màu Brand.Android (Material Design 3):Tonal Palettes: Android 12+ có tính năng Dynamic Color. Tuy nhiên, với app Brand như Taseco, hãy giữ cố định các màu Primary/Secondary để bảo vệ nhận diện thương hiệu.Elevation: Ở Dark mode, không dùng Shadow. Hãy dùng độ sáng của màu bg-surface để thể hiện độ cao (Càng cao càng sáng).4. Quy tắc Gradient & Trạng thái nút (Interaction)Primary Button:Default: Gradient 135deg, #1E3066, #2E4BB0.Pressed (Android): Thêm lớp Ripple (gợn sóng) màu trắng mờ.Active (iOS): Giảm Opacity xuống 0.7 khi nhấn.Secondary/Action Button:Dùng màu #F58220. Luôn đi kèm với chữ trắng để đảm bảo độ tương phản (Contrast Ratio > 4.5:1).5. Cấu trúc JSON cho Developer (React Native/Expo)Nếu bạn đang làm dự án bằng React Native như trong hồ sơ năng lực của mình, bạn có thể tổ chức file theme.js như sau:JavaScriptexport const Theme = {
  light: {
    primary: '#1E3066',
    secondary: '#F58220',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
  },
  dark: {
    primary: '#3B52A1', // Sáng hơn một chút để nổi bật trên nền tối
    secondary: '#FF983D',
    background: '#0F172A',
    card: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
  }
};
Lời khuyên nhỏ từ cộng sự AI: Để app trông "xịn" nhất trên cả hai nền tảng, hãy chú ý đến Safe Area (phần tai thỏ trên iPhone và thanh trạng thái trên Android). Hãy để màu của Navigation Bar trùng với màu bg-primary để tạo cảm giác màn hình tràn viền vô cực nhé!