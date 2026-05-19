import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { usePushDeepLink } from "@stos/mobile-shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts, BeVietnamPro_400Regular, BeVietnamPro_600SemiBold, BeVietnamPro_700Bold } from "@expo-google-fonts/be-vietnam-pro";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { AuthProvider } from "../hooks/useAuth";
import { ThemeProvider } from "../hooks/useTheme";

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const [loaded] = useFonts({ BeVietnamPro_400Regular, BeVietnamPro_600SemiBold, BeVietnamPro_700Bold });
  usePushDeepLink(router);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false, animation: Platform.OS === "ios" ? "default" : "fade" }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)/login" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="attendance/index" />
              <Stack.Screen name="queue/index" />
              <Stack.Screen name="queue/[id]" />
              <Stack.Screen name="sos" options={{ presentation: "fullScreenModal" }} />
              <Stack.Screen name="guests/scan" options={{ presentation: "modal" }} />
              <Stack.Screen name="guests/walkin" />
              <Stack.Screen name="guests/checkout" />
              <Stack.Screen name="patrol/[routeId]" />
              <Stack.Screen name="situation/new" options={{ presentation: "modal" }} />
              <Stack.Screen name="parcels/receive" />
              <Stack.Screen name="coming-soon" options={{ presentation: "modal" }} />
            </Stack>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
