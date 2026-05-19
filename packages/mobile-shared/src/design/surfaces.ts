import { Platform, StyleSheet, type ViewStyle } from "react-native";

/** Soft card shadow — mockup Life (light: diffuse, dark: subtle glow) */
export function softCardShadow(isDark: boolean): ViewStyle {
  if (Platform.OS === "android") {
    return { elevation: isDark ? 4 : 3 };
  }
  return isDark
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
      }
    : {
        shadowColor: "#1E3066",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 18,
      };
}

export function mockCardStyle(opts: {
  isDark: boolean;
  backgroundColor: string;
  borderColor: string;
  radius?: number;
}): ViewStyle {
  const r = opts.radius ?? 20;
  return {
    backgroundColor: opts.backgroundColor,
    borderRadius: r,
    borderWidth: opts.isDark ? StyleSheet.hairlineWidth : 1,
    borderColor: opts.borderColor,
    ...softCardShadow(opts.isDark),
  };
}

export function iconTileStyle(bg: string, size = 52, radius = 14): ViewStyle {
  return {
    width: size,
    height: size,
    borderRadius: radius,
    backgroundColor: bg,
    alignItems: "center",
    justifyContent: "center",
  };
}

/** Nền màn hình theo mockup */
export const lifeBackground = {
  light: "#F5F7FA",
  dark: "#0B0E14",
} as const;

export const lifeCard = {
  light: "#FFFFFF",
  dark: "#151921",
} as const;

export const lifeBorder = {
  light: "#E8ECF2",
  dark: "rgba(255,255,255,0.08)",
} as const;
