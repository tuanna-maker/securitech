export type AnalyticsEvent =
  | "onboarding_complete"
  | "empty_state_view"
  | "hero_cover_loaded";

export function trackEvent(event: AnalyticsEvent, props?: Record<string, string | number | boolean>) {
  if (__DEV__) {
    console.log("[analytics]", event, props ?? {});
  }
}
