import { Tabs, Redirect } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

type TabIcon = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, color, focused }: { name: TabIcon; color: string; focused: boolean }) {
  return <Ionicons name={focused ? name : (`${name}-outline` as TabIcon)} size={24} color={color} />;
}

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();

  if (!loading && !user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          position: Platform.OS === "ios" ? "absolute" : undefined,
          backgroundColor: Platform.OS === "ios" ? "transparent" : colors.tabBar,
          borderTopColor: colors.separator,
          borderTopWidth: Platform.OS === "ios" ? StyleSheet.hairlineWidth : 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tổng quan",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="grid" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="buildings"
        options={{
          title: "Tòa nhà",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="business" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          title: "Sự cố",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="warning" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Thêm",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="ellipsis-horizontal" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
});
