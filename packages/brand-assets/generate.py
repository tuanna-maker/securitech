#!/usr/bin/env python3
"""Generate app icons and logos from clean source (no corner badge)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
SOURCE = ROOT / "logo-source.png"
SHEET = ROOT / "logo-sheet-4variants.png"
APPS = [REPO / "apps" / "stos-life", REPO / "apps" / "stos-guard"]


def white_to_alpha(img: Image.Image, threshold: int = 245) -> Image.Image:
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                px[x, y] = (r, g, b, 0)
    return img


def make_square(pil_img: Image.Image, size: int = 1024, padding: float = 0.12, bg=(255, 255, 255, 255)) -> Image.Image:
    iw, ih = pil_img.size
    side = int(max(iw, ih) * (1 + padding * 2))
    canvas = Image.new("RGBA", (side, side), bg)
    scale = min((side * (1 - padding * 2)) / iw, (side * (1 - padding * 2)) / ih)
    nw, nh = int(iw * scale), int(ih * scale)
    resized = pil_img.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(resized, ((side - nw) // 2, (side - nh) // 2), resized)
    return canvas.resize((size, size), Image.Resampling.LANCZOS)


def load_logo() -> Image.Image:
    if SOURCE.exists():
        img = Image.open(SOURCE).convert("RGBA")
        w, h = img.size
        # Strip possible corner badge (top-left dark square with "1")
        return img.crop((0, int(h * 0.02), w, h))
    if SHEET.exists():
        img = Image.open(SHEET).convert("RGBA")
        w, h = img.size
        return img.crop((0, 0, w // 2, h // 2))
    raise FileNotFoundError("Add logo-source.png or logo-sheet-4variants.png")


def main() -> None:
    logo = load_logo()
    logo.save(ROOT / "logo-system-1.png")

    lw, lh = logo.size
    compact = logo.crop((int(lw * 0.02), int(lh * 0.02), int(lw * 0.98), int(lh * 0.88)))
    compact.save(ROOT / "logo-system-1-compact.png")
    logo_ui = white_to_alpha(compact)

    emblem = logo.crop((int(lw * 0.12), int(lh * 0.02), int(lw * 0.88), int(lh * 0.48)))
    emblem.save(ROOT / "logo-emblem.png")

    icon = make_square(white_to_alpha(emblem), padding=0.1, bg=(255, 255, 255, 255))
    adaptive = make_square(white_to_alpha(emblem), padding=0.08, bg=(0, 0, 0, 0))
    splash = make_square(compact, padding=0.12, bg=(30, 48, 102, 255))

    icon.save(ROOT / "icon-1024.png")
    adaptive.save(ROOT / "adaptive-icon-1024.png")
    splash.save(ROOT / "splash-icon-1024.png")

    for app in APPS:
        assets = app / "assets"
        assets.mkdir(parents=True, exist_ok=True)
        logo_ui.save(assets / "logo.png")
        icon.save(assets / "icon.png")
        adaptive.save(assets / "adaptive-icon.png")
        splash.save(assets / "splash-icon.png")

    print("Synced brand assets (no badge) to", ", ".join(a.name for a in APPS))


if __name__ == "__main__":
    main()
