import type { StosIconName } from "./types";

/** Màu nền + glyph theo mockup Life / Guard */
export const LIFE_ICON_PRESETS: Record<string, { name: StosIconName; bg: string; color: string }> = {
  family: { name: "tab-family", bg: "#EDE9FE", color: "#7C3AED" },
  security: { name: "tab-shield", bg: "#DBEAFE", color: "#2563EB" },
  health: { name: "tab-health", bg: "#CCFBF1", color: "#0D9488" },
  guests: { name: "qr-guest", bg: "#FFEDD5", color: "#EA580C" },
  parcels: { name: "parcel", bg: "#FEF9C3", color: "#CA8A04" },
  farm: { name: "leaf-store", bg: "#DCFCE7", color: "#16A34A" },
};

export const GUARD_ACTION_PRESETS = {
  checkin: { name: "checkin" as const, bg: "#34C759", color: "#FFFFFF" },
  checkout: { name: "checkout" as const, bg: "#FF3B30", color: "#FFFFFF" },
  patrol: { name: "patrol" as const, bg: "#007AFF", color: "#FFFFFF" },
  incident: { name: "incident" as const, bg: "#FF9500", color: "#FFFFFF" },
  queue: { name: "queue-people" as const, bg: "#5856D6", color: "#FFFFFF" },
};
