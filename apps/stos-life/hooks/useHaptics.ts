import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export function useHaptics() {
  return {
    selection: () => Platform.OS === "ios" && Haptics.selectionAsync(),
    success: () => Platform.OS === "ios" && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    error: () => Platform.OS === "ios" && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    impact: (style: "light" | "medium" | "heavy" = "light") => {
      if (Platform.OS !== "ios") return;
      const map = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      return Haptics.impactAsync(map[style]);
    },
  };
}
