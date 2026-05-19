import { Platform, StyleSheet, type ViewStyle } from "react-native";

/** Nền & thẻ mockup Guard dark */
export const guardPalette = {
  bg: "#0B0E14",
  card: "#161B22",
  cardBorder: "#252D3A",
  elevated: "#1E2633",
  gold: "#F5C842",
  goldDim: "#C9A227",
} as const;

export function guardCard(isDark = true): ViewStyle {
  return {
    backgroundColor: guardPalette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: guardPalette.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
      default: {},
    }),
  };
}

/** Nút action màu — viền sáng trên + bóng */
export function guardActionTile(bg: string): ViewStyle {
  return {
    backgroundColor: bg,
    borderRadius: 18,
    borderWidth: 1,
    borderTopColor: "rgba(255,255,255,0.28)",
    borderColor: "rgba(0,0,0,0.25)",
    ...Platform.select({
      ios: {
        shadowColor: bg,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.55,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
      default: {},
    }),
  };
}
