import { TextInput, View, Text, StyleSheet, Platform } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { radii, spacing, textStyle } from "../../design/layout";

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
}: {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  const { colors } = useTheme();
  const outlined = Platform.OS === "android";
  return (
    <View style={styles.wrap}>
      {label ? <Text style={[textStyle("footnote", "semibold"), { color: colors.textTertiary, marginBottom: spacing.xs }]}>{label.toUpperCase()}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={[
          textStyle("body"),
          styles.input,
          outlined && styles.outlined,
          {
            color: colors.text,
            backgroundColor: outlined ? colors.groupedBackground : "transparent",
            borderColor: colors.border,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  input: { paddingVertical: spacing.md, minHeight: 44, borderRadius: radii.md },
  outlined: { paddingHorizontal: spacing.md, borderWidth: 1 },
});
