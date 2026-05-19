# STOS brand assets

## Logo sources

- `logo-source.png` — logo chính **không có badge số 1** (ưu tiên dùng khi generate).
- `security-tech-logo.svg` / `security-tech-emblem.svg` — vector cho web/print.
- `logo-sheet-4variants.png` — sheet 4 biến thể (fallback).
- Regenerate PNG app icons: `python3 generate.py` (requires Pillow).

In-app vector: `@stos/mobile-shared` → `SecurityTechLogo`.

## App icons

| File | Use |
|------|-----|
| `icon-1024.png` | iOS/Android store icon (emblem, safe zone ~80%) |
| `adaptive-icon-1024.png` | Android adaptive foreground |
| `splash-icon-1024.png` | Splash center mark on `#1E3066` |
| `logo-system-1-compact.png` | In-app logo (wordmark + shield) |

## Illustrations

- Source specs live in `packages/mobile-shared/src/illustrations/` (React SVG).
- **No text inside image files** — copy lives in app strings for i18n.
- Palette: navy `#1E3066`, cyan `#00AEEF`, mid `#2E4BB0`.

## Safe zone (icon)

Keep emblem inside central 80% circle; no small text on home-screen icon.
