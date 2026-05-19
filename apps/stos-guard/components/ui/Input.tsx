import { TextInput, View, Text, StyleSheet, TextInputProps, Platform } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { radii, spacing, textStyle } from "../../lib/design";

export function Input({
  label,
  ...props
}: TextInputProps & { label?: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[textStyle("subhead", "semibold"), styles.label, { color: colors.textSecondary }]}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.input,
          textStyle("body"),
          {
            backgroundColor: colors.fill,
            color: colors.text,
          },
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    marginLeft: spacing.xs,
    marginBottom: spacing.sm,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === "ios" ? 13 : 12,
    minHeight: 44,
  },
});
