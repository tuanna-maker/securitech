import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { lifeTokens } from "../lib/lifeTheme";
import { colors } from "../lib/theme";

const ThemeContext = createContext({
  colors: colors.light,
  life: lifeTokens.light,
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const value = useMemo(
    () => ({
      colors: isDark ? colors.dark : colors.light,
      life: isDark ? lifeTokens.dark : lifeTokens.light,
      isDark,
    }),
    [isDark]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
