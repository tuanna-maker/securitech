import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { StosIcon, StosTabIcon } from "@stos/mobile-shared";
import { useTheme } from "../../hooks/useTheme";

export default function TabLayout() {
  const { colors, life, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: life.navActive,
        tabBarInactiveTintColor: life.navInactive,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: life.border,
          backgroundColor: life.navBg,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={isDark ? 50 : 80} tint={isDark ? "dark" : "light"} style={{ flex: 1 }} />
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
        name="spending"
        options={{
          title: "Chi tiêu",
          tabBarIcon: ({ color }) => <StosIcon name="wallet" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="security"
        options={{
          title: "Dịch vụ bảo an",
          tabBarIcon: ({ color, size }) => <StosTabIcon name="tab-shield" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "Sức khỏe",
          tabBarIcon: ({ color, size }) => <StosTabIcon name="tab-health" color={color} size={size ?? 24} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color, size }) => <StosTabIcon name="tab-account" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="family" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
    </Tabs>
  );
}
