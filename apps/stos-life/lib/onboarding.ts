import * as SecureStore from "expo-secure-store";

const KEY = "stos_life_onboarding_v1";

export async function isOnboardingComplete(): Promise<boolean> {
  const v = await SecureStore.getItemAsync(KEY);
  return v === "1";
}

export async function setOnboardingComplete(): Promise<void> {
  await SecureStore.setItemAsync(KEY, "1");
}
