# STOS icon set (SVG)

Bộ icon outline 24×24 khớp mockup Life & Guard.

## Nguồn chính (runtime)

Geometry được định nghĩa trong:

- `packages/mobile-shared/src/icons/StosIcon.tsx` — render React Native (`react-native-svg`)
- `packages/mobile-shared/src/icons/types.ts` — tên icon (`StosIconName`)
- `packages/mobile-shared/src/icons/presets.ts` — màu nền + glyph theo mockup

Dùng trong app:

```tsx
import { StosIcon, StosTabIcon, StosIconTile, LIFE_ICON_PRESETS } from "@stos/mobile-shared";

<StosIcon name="tab-shield" size={24} color="#2563EB" />
```

## File `.svg` trong thư mục này

Các file SVG mẫu (`tab-home.svg`, `shield-badge.svg`, `checkin.svg`, …) dùng cho Figma / web / export store. Cùng stroke 1.75px, `viewBox="0 0 24 24"`, màu qua `currentColor`.

Để đồng bộ toàn bộ icon sang SVG tĩnh, copy path từ `StosIcon.tsx` (mỗi `case` tương ứng một file `tên-icon.svg`).

## Quy ước thiết kế

- Stroke: **1.75px**, round cap/join
- Kích thước logic: **24×24**
- Tab bar: component `StosTabIcon`
- Ô quick action (pastel): `StosIconTile` hoặc ô vuông + `StosIcon`
