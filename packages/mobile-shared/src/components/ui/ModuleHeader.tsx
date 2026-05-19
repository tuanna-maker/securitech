import { Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { spacing, textStyle } from "../../design/layout";

export function ModuleHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <>
      <Text style={[textStyle("title2", "bold"), { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[textStyle("subhead"), styles.sub, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({ sub: { marginTop: spacing.xs, marginBottom: spacing.lg } });
