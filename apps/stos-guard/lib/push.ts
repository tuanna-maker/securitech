import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { db } from "./db";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerPushToken(userId: string, tenantId?: string) {
  let tid = tenantId;
  if (!tid) {
    const { data } = await db.from("staff_members").select("tenant_id").eq("user_id", userId).maybeSingle();
    tid = data?.tenant_id;
  }
  if (!tid) return null;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== "granted") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  const tokenData = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
  const token = tokenData.data;
  await db.from("device_tokens").upsert(
    {
      user_id: userId,
      tenant_id: tid,
      app_role: "guard",
      token,
      platform: Platform.OS === "ios" ? "ios" : "android",
    },
    { onConflict: "user_id,app_role,token" }
  );
  return token;
}
