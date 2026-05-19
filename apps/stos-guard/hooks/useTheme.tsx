import { createContext, useContext, useMemo, type ReactNode } from "react";
import { colors } from "../lib/theme";

const ThemeContext = createContext({ colors: colors.guard, isDark: true });

/** Guard UI mockup = dark ops theme (luôn dùng palette tối) */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ colors: colors.guard, isDark: true }), []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
