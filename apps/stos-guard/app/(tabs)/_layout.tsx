import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { StosTabIcon } from "@stos/mobile-shared";
import { guardPalette } from "../../lib/guardSurfaces";
import { useTheme } from "../../hooks/useTheme";

export default function TabLayout() {
  const { colors } = useTheme();

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
          borderTopColor: guardPalette.cardBorder,
          backgroundColor: guardPalette.bg,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingTop: 6,
        },
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
        name="schedule"
        options={{
          title: "Lịch trực",
          tabBarIcon: ({ color, size }) => <StosTabIcon name="tab-calendar" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",
          tabBarBadge: 2,
          tabBarIcon: ({ color, size }) => <StosTabIcon name="tab-bell" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color, size }) => <StosTabIcon name="tab-account" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
