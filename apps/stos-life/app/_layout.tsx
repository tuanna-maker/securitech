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
              <Stack.Screen name="(auth)/activate" />
              <Stack.Screen name="(onboarding)/index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="grab/select" options={{ presentation: "modal" }} />
              <Stack.Screen name="grab/confirm" options={{ presentation: "modal" }} />
              <Stack.Screen name="grab/[id]/index" />
              <Stack.Screen name="grab/[id]/map" />
              <Stack.Screen name="grab/[id]/rate" options={{ presentation: "modal" }} />
              <Stack.Screen name="sos" options={{ presentation: "fullScreenModal" }} />
              <Stack.Screen name="guests/index" />
              <Stack.Screen name="guests/[id]" />
              <Stack.Screen name="parcels/index" />
              <Stack.Screen name="farm/index" />
              <Stack.Screen name="farm/cart" />
              <Stack.Screen name="farm/orders" />
              <Stack.Screen name="incidents/new" options={{ presentation: "modal" }} />
              <Stack.Screen name="daily/new" options={{ presentation: "modal" }} />
              <Stack.Screen name="family/spending" />
              <Stack.Screen name="community-feed" />
              <Stack.Screen name="coming-soon" options={{ presentation: "modal" }} />
            </Stack>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
