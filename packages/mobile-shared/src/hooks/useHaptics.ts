import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/** MOBILE_UIUX_GUIDELINES §1.3 */
export function useHaptics() {
  return {
    selection: () => {
      if (Platform.OS === "ios") return Haptics.selectionAsync();
    },
    success: () => {
      if (Platform.OS === "ios") {
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    error: () => {
      if (Platform.OS === "ios") {
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    impact: (style: "light" | "medium" | "heavy" = "light") => {
      if (Platform.OS === "ios") {
        const map = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
        };
        return Haptics.impactAsync(map[style]);
      }
    },
  };
}
