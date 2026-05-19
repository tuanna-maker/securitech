import { Platform } from "react-native";

/** iOS page sheet vs Android full-screen push */
export function usePlatformNav() {
  return {
    modalPresentation: Platform.OS === "ios" ? ("modal" as const) : ("card" as const),
    fullScreenModal: "fullScreenModal" as const,
    useRipple: Platform.OS === "android",
  };
}
