import { Tabs, Redirect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Text } from "react-native";

function TabLabel({ title, focused, color }: { title: string; focused: boolean; color: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: focused ? "700" : "500", color }}>{title}</Text>
  );
}

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();

  if (!loading && !user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tổng quan",
          tabBarLabel: ({ focused, color }) => <TabLabel title="Tổng quan" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="buildings"
        options={{
          title: "Tòa nhà",
          tabBarLabel: ({ focused, color }) => <TabLabel title="Tòa nhà" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          title: "Sự cố",
          tabBarLabel: ({ focused, color }) => <TabLabel title="Sự cố" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Thêm",
          tabBarLabel: ({ focused, color }) => <TabLabel title="Thêm" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}
