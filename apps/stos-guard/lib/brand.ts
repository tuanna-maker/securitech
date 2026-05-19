export const brand = {
  navy: "#1E3066",
  navyLight: "#2E4BB0",
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
  success: "#22C55E",
  warning: "#FACC15",
  error: "#EF4444",
} as const;

export const gradients = {
  primary: [brand.navy, brand.navyLight] as const,
  guardHero: [brand.navy, brand.navyLight] as const,
  action: [brand.orange, brand.orangeLight] as const,
} as const;

export const guardMainColors = {
  checkin: { bg: "#34C759" },
  checkout: { bg: "#FF3B30" },
  patrol: { bg: "#007AFF" },
  incident: { bg: "#FF9500" },
  queue: { bg: "#5856D6" },
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
