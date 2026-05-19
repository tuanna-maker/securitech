import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../hooks/useTheme";

export function TabBarBackground() {
  const { isDark } = useTheme();
  if (Platform.OS !== "ios") return null;
  return <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />;
}

export function tabBarScreenOptions(isDark: boolean) {
  return {
    tabBarStyle: {
      position: "absolute" as const,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDark ? "rgba(84,84,88,0.65)" : "rgba(60,60,67,0.18)",
      backgroundColor: Platform.OS === "ios" ? "transparent" : isDark ? "#1C1C1E" : "#FFFFFF",
    },
    tabBarBackground: Platform.OS === "ios" ? () => <TabBarBackground /> : undefined,
  };
}
