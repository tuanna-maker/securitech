import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { isOnboardingComplete } from "../lib/onboarding";

export default function Index() {
  const { loading, session, resident } = useAuth();
  const { colors } = useTheme();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    if (session && resident) isOnboardingComplete().then(setOnboarded);
  }, [session, resident]);

  if (loading || (session && resident && onboarded === null)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }
  if (!session) return <Redirect href="/(auth)/login" />;
  if (!resident) return <Redirect href="/(auth)/activate" />;
  if (!onboarded) return <Redirect href="/(onboarding)" />;
  return <Redirect href="/(tabs)" />;
}
