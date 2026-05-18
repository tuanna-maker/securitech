import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { ModuleRouter } from "../../components/screens/ModuleRouter";
import { ModuleHeader } from "../../components/ui/ModuleHeader";
import type { ModuleId } from "../../constants/modules";

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.flex}>
      <Stack.Screen options={{ headerShown: false }} />
      <ModuleHeader title="" />
      <View style={styles.flex}>
        <ModuleRouter id={(id as ModuleId) ?? "dashboard"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
