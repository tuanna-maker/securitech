# STOS Life — HTML mockups (mobile)

Bản HTML **chuẩn giao diện** — icon 3D vẽ bằng **SVG vector** (gradient + drop shadow), mô tả lại từ mockup Figma/ảnh bạn gửi. **Không crop PNG** (tránh lệch vị trí và vỡ nét).

## Mở file

```bash
open "/Users/uranus/Documents/vibe coding/securitech/docs/mockups/stos-life-family.html"
```

Chrome DevTools → **iPhone 14 Pro** (390×844).

## Cấu trúc

| Path | Mô tả |
|------|--------|
| `stos-life-family.html` | Màn **Gia đình tôi** đầy đủ (sprite SVG nhúng sẵn) |
| `icons-3d.svg` | Nguồn symbol icon 3D (đồng bộ với HTML) |
| `assets/*.jpg` | Ảnh cắt từ mockup (avatar, bé, thực phẩm, khoảnh khắc) — **không dùng Unsplash** |

## Token (khớp mockup)

| Token | Giá trị |
|-------|--------|
| Nền màn | `#F5F7FA` |
| Thẻ | `#FFFFFF` |
| Chữ chính | `#1A1A1A` |
| Xanh primary | `#1A5CFF` |
| Navy logo | `#1E3066` |
| Pill thành viên | nền `#DBEAFE`, chữ `#1D4ED8` |
| Xu hướng giảm | `#4CD964` |
| Cảnh báo cam | `#FF9500` |
| Viền ô | `#E8EBF0` |

## Kích thước icon (CSS)

| Vùng | Biến | px |
|------|------|-----|
| Quick action | `--icon-quick` | 48 |
| Quản lý 2×2 | `--icon-mgmt` | 52 |
| Dịch vụ | `--icon-service` | 44 |
| Robot AI | `--icon-ai-robot` | 48 |
| Chip AI | `--icon-chip` | 20 |

## Cập nhật icon

1. Sửa shape/gradient trong `icons-3d.svg`
2. Chạy lại script nhúng sprite (hoặc copy `<defs>` vào đầu `<body>` trong HTML)
3. Reload trình duyệt

## Port sang React Native

Dùng cùng path từ `icons-3d.svg` với `react-native-svg` (`<Svg>` + `<Defs>` + symbol), hoặc export từng symbol thành component riêng trong `apps/stos-life/components/life/family/`.
