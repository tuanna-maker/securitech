/** STOS brand — docs/THEMES_MOBILE.md */
export const brand = {
  navy: "#1E3066",
  navyLight: "#2E4BB0",
  navyMuted: "#3B52A1",
  techCyan: "#00AEEF",
  illustration: {
    stroke: "#1E3066",
    fillDark: "#1E3066",
    fillMid: "#2E4BB0",
    fillLight: "#00AEEF",
    fillPale: "#93C5FD",
  },
  orange: "#F58220",
  orangeLight: "#FF983D",
  grab: "#EF4444",
  grabLight: "#F97316",
  success: "#22C55E",
  warning: "#FACC15",
  error: "#EF4444",
} as const;

export const gradients = {
  primary: [brand.navy, brand.navyLight] as const,
  lifeHero: [brand.navy, "#2563EB"] as const,
  grab: [brand.grab, brand.grabLight] as const,
  warm: [brand.orange, brand.orangeLight] as const,
  surface: ["#FFFFFF", "#F8FAFC"] as const,
} as const;

export const shortcutColors = {
  guests: { bg: "#DBEAFE", icon: "#2563EB", label: "Khách" },
  parcels: { bg: "#D1FAE5", icon: "#059669", label: "Bưu phẩm" },
  sos: { bg: "#FEE2E2", icon: "#DC2626", label: "SOS" },
  farm: { bg: "#DCFCE7", icon: "#16A34A", label: "Farm" },
  incidents: { bg: "#FFEDD5", icon: "#EA580C", label: "Sự cố" },
  daily: { bg: "#E0E7FF", icon: "#4F46E5", label: "Hàng ngày" },
} as const;

export const guardActionColors: Record<string, { bg: string; icon: string }> = {
  attendance: { bg: "#E0E7FF", icon: "#4F46E5" },
  patrol: { bg: "#DCFCE7", icon: "#16A34A" },
  queue: { bg: "#FFEDD5", icon: brand.orange },
  situation: { bg: "#FEF3C7", icon: "#D97706" },
  guests: { bg: "#DBEAFE", icon: "#2563EB" },
  parcels: { bg: "#D1FAE5", icon: "#059669" },
  sos: { bg: "#FEE2E2", icon: "#DC2626" },
  notify: { bg: "#F3E8FF", icon: "#7C3AED" },
};
