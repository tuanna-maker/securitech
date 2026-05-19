import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, Platform } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useHaptics } from "../../hooks/useHaptics";
import { radii, textStyle, touchTarget } from "../../design/layout";

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger" | "plain";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}) {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const bg =
    variant === "primary" ? colors.primary : variant === "secondary" ? colors.secondary : variant === "danger" ? colors.danger : "transparent";
  const textColor = variant === "primary" || variant === "danger" ? "#FFFFFF" : variant === "secondary" ? "#FFFFFF" : variant === "plain" ? colors.tint : colors.tint;

  return (
    <Pressable
      onPress={() => {
        haptics.impact("light");
        onPress();
      }}
      disabled={disabled || loading}
      android_ripple={Platform.OS === "android" && variant !== "plain" ? { color: "rgba(255,255,255,0.2)" } : undefined}
      style={({ pressed }) => [
        styles.btn,
        variant !== "plain" && { backgroundColor: bg, minHeight: touchTarget },
        variant === "outline" && { borderWidth: 1, borderColor: colors.tint, backgroundColor: "transparent" },
        variant === "plain" && styles.plain,
        { opacity: pressed ? 0.72 : disabled ? 0.4 : 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[textStyle("body", "semibold"), { color: variant === "outline" ? colors.tint : textColor }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: radii.button, alignItems: "center", justifyContent: "center" },
  plain: { minHeight: touchTarget, justifyContent: "center", paddingHorizontal: 4 },
});
