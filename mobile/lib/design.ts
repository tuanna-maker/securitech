import { Platform, StyleSheet, type TextStyle, type ViewStyle } from "react-native";

/** Apple HIG–aligned spacing & layout tokens */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
} as const;

export const radii = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  group: 10,
  button: 12,
  pill: 999,
} as const;

export const typography = {
  largeTitle: { fontSize: 34, fontWeight: "700" as const, letterSpacing: 0.37 },
  title1: { fontSize: 28, fontWeight: "700" as const, letterSpacing: 0.36 },
  title2: { fontSize: 22, fontWeight: "700" as const, letterSpacing: 0.35 },
  title3: { fontSize: 20, fontWeight: "600" as const, letterSpacing: 0.38 },
  headline: { fontSize: 17, fontWeight: "600" as const, letterSpacing: -0.41 },
  body: { fontSize: 17, fontWeight: "400" as const, letterSpacing: -0.41 },
  callout: { fontSize: 16, fontWeight: "400" as const, letterSpacing: -0.32 },
  subhead: { fontSize: 15, fontWeight: "400" as const, letterSpacing: -0.24 },
  footnote: { fontSize: 13, fontWeight: "400" as const, letterSpacing: -0.08 },
  caption1: { fontSize: 12, fontWeight: "400" as const, letterSpacing: 0 },
  caption2: { fontSize: 11, fontWeight: "400" as const, letterSpacing: 0.07 },
} as const;

/** iOS uses San Francisco; Android keeps Be Vietnam Pro */
export function fontFamily(weight: "regular" | "semibold" | "bold" = "regular"): string | undefined {
  if (Platform.OS === "ios") return undefined;
  const map = {
    regular: "BeVietnamPro_400Regular",
    semibold: "BeVietnamPro_600SemiBold",
    bold: "BeVietnamPro_700Bold",
  };
  return map[weight];
}

export function textStyle(
  variant: keyof typeof typography,
  weight: "regular" | "semibold" | "bold" = "regular"
): TextStyle {
  const t = typography[variant];
  const w =
    weight === "bold" ? "700" : weight === "semibold" ? "600" : (t.fontWeight as TextStyle["fontWeight"]);
  return {
    ...t,
    fontWeight: w,
    fontFamily: fontFamily(weight === "regular" ? "regular" : weight),
  };
}

export const touchTarget = 44;

export function hairlineBorder(color: string): ViewStyle {
  return Platform.select({
    ios: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: color },
    default: { borderBottomWidth: 1, borderBottomColor: color },
  }) as ViewStyle;
}

export function cardShadow(isDark: boolean): ViewStyle {
  if (Platform.OS !== "ios") return {};
  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.35 : 0.06,
    shadowRadius: 4,
  };
}
