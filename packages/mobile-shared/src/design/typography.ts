export { typography, spacing, radii, touchTarget } from "./tokens";

import { Platform, StyleSheet, type TextStyle, type ViewStyle } from "react-native";
import { typography as typeScale } from "./tokens";

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
  variant: keyof typeof typeScale,
  weight: "regular" | "semibold" | "bold" = "regular"
): TextStyle {
  const t = typeScale[variant];
  const w =
    weight === "bold" ? "700" : weight === "semibold" ? "600" : (t.fontWeight as TextStyle["fontWeight"]);
  return {
    ...t,
    fontWeight: w,
    fontFamily: fontFamily(weight === "regular" ? "regular" : weight),
  };
}

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
