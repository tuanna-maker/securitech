import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { colors as palette, type ThemeColors } from "../design/theme";

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  appAccent?: "life" | "guard";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  appAccent,
}: {
  children: ReactNode;
  appAccent?: "life" | "guard";
}) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const value = useMemo(() => {
    const base = isDark ? palette.dark : palette.light;
    const colors: ThemeColors = {
      ...base,
      tint: appAccent === "guard" ? base.secondary : appAccent === "life" ? base.grab : base.tint,
    };
    return { colors, isDark, appAccent };
  }, [isDark, appAccent]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
