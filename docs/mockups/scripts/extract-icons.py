#!/usr/bin/env python3
"""Crop icon 3D từ mockup PNG — chỉnh toạ độ trong CROPS nếu layout đổi."""
from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("pip install Pillow")

ROOT = Path(__file__).resolve().parents[1]
ICONS = ROOT / "icons"
SOURCE = ROOT / "assets" / "source-mockup.png"
# fallback: ảnh telegram trong cursor assets
FALLBACK = Path(
    "/Users/uranus/.cursor/projects/Users-uranus-Documents-vibe-coding-securitech/assets/"
    "telegram-cloud-photo-size-5-6077798626072661736-y-382a919f-14ea-4d44-8a5b-7baed548aedf.png"
)

CROPS: dict[str, tuple[int, int, int, int]] = {
    "quick-members": (52, 258, 118, 324),
    "quick-calendar": (188, 258, 254, 324),
    "quick-memories": (324, 258, 390, 324),
    "quick-settings": (460, 258, 526, 324),
    "mgmt-wallet": (44, 392, 132, 480),
    "mgmt-child": (364, 392, 452, 480),
    "mgmt-food": (44, 612, 132, 700),
    "mgmt-health": (364, 612, 452, 700),
    "svc-travel": (22, 742, 94, 814),
    "svc-home": (142, 742, 214, 814),
    "svc-car": (262, 742, 334, 814),
    "svc-shop": (382, 742, 454, 814),
    "svc-vip": (502, 742, 574, 814),
    "ai-robot": (30, 862, 106, 938),
    "health-pill": (368, 688, 396, 716),
    "health-clinic": (368, 728, 396, 756),
    "brand-emblem": (34, 54, 90, 110),
}


def main() -> None:
    src = SOURCE if SOURCE.exists() else FALLBACK
    if not src.exists():
        raise SystemExit(f"Missing source image: {SOURCE} or {FALLBACK}")

    ICONS.mkdir(parents=True, exist_ok=True)
    im = Image.open(src).convert("RGBA")

    for name, box in CROPS.items():
        c = im.crop(box)
        c.save(ICONS / f"{name}.png")
        c.resize((c.width * 2, c.height * 2), Image.Resampling.LANCZOS).save(
            ICONS / f"{name}@2x.png"
        )
        print(f"{name}: {c.size}")

    print("Done →", ICONS)


if __name__ == "__main__":
    main()
