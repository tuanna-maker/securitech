import { Alert, Platform } from "react-native";

/** iOS native Alert; Android centered M3-style via RN Alert */
export function showAlert(title: string, message?: string, buttons?: { text: string; style?: "default" | "cancel" | "destructive"; onPress?: () => void }[]) {
  if (Platform.OS === "ios") {
    Alert.alert(title, message, buttons);
    return;
  }
  Alert.alert(title, message, buttons);
}
