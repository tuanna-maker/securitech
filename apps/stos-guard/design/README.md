# STOS Guard — HTML mockup

Mở trong trình duyệt:

**[STOS-Guard-Final-Dark.html](./STOS-Guard-Final-Dark.html)**

## File

| File | Mô tả |
|------|--------|
| `stos-guard-icons.js` | Toàn bộ icon SVG |
| `stos-guard-mockup.css` | Token màu, layout 390×844, safe-area |
| `stos-guard-mockup.js` | 6 màn + demo tương tác |

## 6 màn hình

1. **Trang chủ** — header vàng, profile, lưới 2×2, yêu cầu cư dân, tab 4 mục  
2. **Vào ca** — map vòng xanh, thẻ giờ + info, nút xanh cố định  
3. **Kết thúc ca** — map đỏ, checklist ô vuông xanh, nút đỏ  
4. **Lịch trực** — tuần, thẻ 3 cột (ngày / ca / badge)  
5. **Tuần tra** — progress 40%, 5 điểm + chevron, QR, tab 5 mục  
6. **Báo sự cố** — stepper, lưới 6 loại 2 dòng chữ, tab Thông báo active  

## Kỹ thuật (APK / iOS)

- Font: `-apple-system` (San Francisco trên iOS)  
- `viewport-fit=cover` + `env(safe-area-inset-*)`  
- Khung logic **390×844** (iPhone 14) — scale trên WebView RN  
- Icon **SVG** — port sang `react-native-svg` dễ dàng  
- Màu đồng bộ `apps/stos-guard` (`#0B0E14`, `#34C759`, …)

## Demo

Khung **「Demo tương tác」**: bấm 4 nút màu hoặc tab để đổi màn; đồng hồ Vào ca chạy thời gian thực.
