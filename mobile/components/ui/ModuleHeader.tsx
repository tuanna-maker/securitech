import { Pressable, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

export function ModuleHeader({ title }: { title: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top + 8, backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}
    >
      <Pressable onPress={() => router.back()} style={styles.back} hitSlop={12}>
        <Text style={[styles.backText, { color: colors.primary }]}>‹ Quay lại</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { borderBottomWidth: 1, paddingBottom: 8, paddingHorizontal: 8 },
  back: { paddingVertical: 4, paddingHorizontal: 8 },
  backText: { fontSize: 16, fontWeight: "600" },
});
