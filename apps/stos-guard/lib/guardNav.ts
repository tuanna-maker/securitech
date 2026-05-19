import { router } from "expo-router";

export function openGuardFeature(title: string, subtitle?: string) {
  router.push({ pathname: "/coming-soon", params: { title, subtitle: subtitle || "" } });
}
