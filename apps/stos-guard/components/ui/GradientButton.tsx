import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { radii, textStyle, touchTarget } from "../../lib/design";
import { gradients } from "../../lib/brand";

export function GradientButton({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "action";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const colors = variant === "action" ? gradients.action : gradients.primary;

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS === "ios") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={disabled || loading}
      android_ripple={{ color: "rgba(255,255,255,0.25)" }}
      style={({ pressed }) => [{ opacity: pressed ? 0.78 : disabled ? 0.45 : 1 }, style]}
    >
      <LinearGradient colors={[...colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={[textStyle("body", "semibold"), styles.text]}>{title}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: { minHeight: touchTarget, paddingVertical: 14, paddingHorizontal: 24, borderRadius: radii.button, alignItems: "center", justifyContent: "center" },
  text: { color: "#FFFFFF" },
});
