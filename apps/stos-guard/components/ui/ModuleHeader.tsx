import { Pressable, Text, View, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { spacing, textStyle } from "../../lib/design";

export function ModuleHeader({ title }: { title: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: insets.top + (Platform.OS === "ios" ? 4 : 8),
          backgroundColor: colors.background,
        },
      ]}
    >
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
      >
        <Ionicons name="chevron-back" size={28} color={colors.tint} />
        <Text style={[textStyle("body"), { color: colors.tint }]}>Quay lại</Text>
      </Pressable>
      <Text style={[textStyle("headline", "semibold"), { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingBottom: spacing.sm, paddingHorizontal: spacing.sm },
  back: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -4,
    marginBottom: spacing.xs,
    minHeight: 44,
  },
});
