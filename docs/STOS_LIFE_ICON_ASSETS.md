# Icon mockup STOS Life — hướng dẫn khớp 100%

## Vấn đề

Icon **Bootstrap / Ionicons / SVG stroke phẳng** không thể giống mockup (gradient 3D, ribbon, lịch có chấm trắng, v.v.).

## Cách đang làm trong code

- `apps/stos-life/components/life/family/LifeGradientIcon.tsx` — SVG + `LinearGradient` + lớp highlight (bóng giả).
- `FamilyQuickTile` — **thẻ trắng** + icon lớn + chữ (đúng hàng 4 nút Thành viên / Lịch / Kỷ niệm / Cài đặt).

## Khớp pixel-perfect (khuyến nghị design)

1. Designer export từ Figma **PNG @2x @3x** (hoặc SVG gradient gốc).
2. Đặt vào `apps/stos-life/assets/icons/life/`:
   - `quick-members.png`
   - `quick-calendar.png`
   - `quick-memories.png`
   - `quick-settings.png`
   - …
3. Dùng trong component:

```tsx
<Image source={require("../../assets/icons/life/quick-members.png")} style={{ width: 44, height: 44 }} />
```

File PNG từ design = **100% giống mockup**; SVG code chỉ ~90–95%.

## Reload app

```bash
cd apps/stos-life && npx expo start --clear
```

Simulator: **Cmd + R**
