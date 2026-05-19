import { useEffect } from "react";
import * as Notifications from "expo-notifications";

type RouterLike = {
  push: (href: string) => void;
};

function navigateFromNotification(router: RouterLike, data: Record<string, unknown> | undefined) {
  const path = (data?.url ?? data?.path) as string | undefined;
  if (path && typeof path === "string") {
    router.push(path.startsWith("/") ? path : `/${path}`);
  }
}

/** Mở màn hình đúng khi user bấm push notification (Life / Guard). */
export function usePushDeepLink(router: RouterLike) {
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      navigateFromNotification(router, response.notification.request.content.data as Record<string, unknown>);
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        navigateFromNotification(router, response.notification.request.content.data as Record<string, unknown>);
      }
    });

    return () => sub.remove();
  }, [router]);
}
