import type { GuardGlyphName } from "../components/guard/GuardGlyphs";

export const GUARD_ACTIONS: {
  key: string;
  title: string;
  subtitle: string;
  glyph: GuardGlyphName;
  bg: string;
}[] = [
  { key: "checkin", title: "VÀO CA", subtitle: "Check-in", glyph: "checkin", bg: "#34C759" },
  { key: "checkout", title: "KẾT THÚC CA", subtitle: "Check-out", glyph: "checkout", bg: "#FF3B30" },
  { key: "patrol", title: "TUẦN TRA", subtitle: "Điểm danh", glyph: "patrol", bg: "#007AFF" },
  { key: "incident", title: "BÁO SỰ CỐ", subtitle: "Gửi báo cáo", glyph: "incident", bg: "#FF9500" },
];

export const GUARD_QUEUE = {
  title: "YÊU CẦU CƯ DÂN",
  subtitle: "Xem & xử lý",
  bg: "#5856D6",
  glyph: "queue" as const,
};

export const INCIDENT_UI: { key: string; label: string; glyph: GuardGlyphName; color: string; bg: string }[] = [
  { key: "security", label: "An ninh", glyph: "incident-security", color: "#FF3B30", bg: "rgba(255,59,48,0.15)" },
  { key: "fire", label: "Cháy nổ", glyph: "incident-fire", color: "#FF3B30", bg: "rgba(255,59,48,0.12)" },
  { key: "technical", label: "Kỹ thuật", glyph: "incident-wrench", color: "#007AFF", bg: "rgba(0,122,255,0.15)" },
  { key: "property", label: "Thất lạc", glyph: "incident-box", color: "#FFCC00", bg: "rgba(255,204,0,0.15)" },
  { key: "traffic", label: "Giao thông", glyph: "incident-car", color: "#5856D6", bg: "rgba(88,86,214,0.15)" },
  { key: "other", label: "Khác", glyph: "incident-more", color: "#94A3B8", bg: "rgba(148,163,184,0.12)" },
];
