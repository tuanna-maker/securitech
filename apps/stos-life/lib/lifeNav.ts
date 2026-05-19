import { router } from "expo-router";

/** Màn placeholder — nghiệp vụ bổ sung sau */
export function openLifeFeature(title: string, subtitle?: string) {
  router.push({ pathname: "/coming-soon", params: { title, subtitle: subtitle || "" } });
}

export function openHref(href: string) {
  router.push(href as never);
}
