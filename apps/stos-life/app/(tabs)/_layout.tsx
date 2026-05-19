import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { StosTabIcon } from "@stos/mobile-shared";
import { useTheme } from "../../hooks/useTheme";

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          backgroundColor: isDark ? "rgba(11, 14, 20, 0.96)" : "rgba(255, 255, 255, 0.96)",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 6,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={isDark ? 60 : 90} tint={isDark ? "dark" : "light"} style={{ flex: 1 }} />
          ) : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, size }) => <StosTabIcon name="tab-home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: "Gia đình tôi",
          tabBarIcon: ({ color, size }) => <StosTabIcon name="tab-family" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: "Dịch vụ",
          tabBarIcon: ({ color, size }) => <StosTabIcon name="tab-shield" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Cộng đồng",
          tabBarIcon: ({ color, size }) => <StosTabIcon name="tab-community" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color, size }) => <StosTabIcon name="tab-account" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="health" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
    </Tabs>
  );
}
