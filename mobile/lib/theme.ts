export const colors = {
  light: {
    primary: "#1E3066",
    secondary: "#F58220",
    background: "#F8F9FA",
    card: "#FFFFFF",
    text: "#1A1A1A",
    textSecondary: "#64748B",
    border: "#E2E8F0",
    danger: "#EF4444",
    success: "#22C55E",
    warning: "#FACC15",
    info: "#3B82F6",
  },
  dark: {
    primary: "#3B52A1",
    secondary: "#FF983D",
    background: "#0F172A",
    card: "#1E293B",
    text: "#F1F5F9",
    textSecondary: "#94A3B8",
    border: "#334155",
    danger: "#F87171",
    success: "#4ADE80",
    warning: "#FDE047",
    info: "#60A5FA",
  },
} as const;

export type ThemeColors = typeof colors.light;

export const statusColors: Record<string, { bg: string; text: string }> = {
  normal: { bg: "#DCFCE7", text: "#166534" },
  warning: { bg: "#FEF9C3", text: "#854D0E" },
  critical: { bg: "#FEE2E2", text: "#991B1B" },
  new: { bg: "#DBEAFE", text: "#1E40AF" },
  processing: { bg: "#FEF9C3", text: "#854D0E" },
  resolved: { bg: "#DCFCE7", text: "#166534" },
  pending: { bg: "#FEE2E2", text: "#991B1B" },
  active: { bg: "#DCFCE7", text: "#166534" },
  offline: { bg: "#F1F5F9", text: "#64748B" },
};
