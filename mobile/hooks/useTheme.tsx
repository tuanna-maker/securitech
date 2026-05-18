import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { colors, type ThemeColors } from "../lib/theme";

type ThemeContextValue = { colors: (typeof colors)["light"] | (typeof colors)["dark"]; isDark: boolean };

const ThemeContext = createContext<ThemeContextValue>({
  colors: colors.light,
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const value = useMemo(
    () => ({ colors: isDark ? colors.dark : colors.light, isDark }),
    [isDark]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
