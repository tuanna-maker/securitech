import { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { cardShadow, radii, spacing, textStyle } from "../../lib/design";

export function GroupedSection({
  title,
  footer,
  children,
}: {
  title?: string;
  footer?: string;
  children: ReactNode;
}) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.wrap}>
      {title ? (
        <Text style={[styles.sectionTitle, textStyle("footnote", "semibold"), { color: colors.textTertiary }]}>
          {title.toUpperCase()}
        </Text>
      ) : null}
      <View
        style={[
          styles.group,
          { backgroundColor: colors.groupedBackground },
          cardShadow(isDark),
        ]}
      >
        {children}
      </View>
      {footer ? (
        <Text style={[styles.footer, textStyle("footnote"), { color: colors.textTertiary }]}>{footer}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  sectionTitle: {
    marginLeft: spacing.lg + 4,
    marginBottom: spacing.sm,
  },
  group: {
    borderRadius: radii.group,
    overflow: "hidden",
  },
  footer: {
    marginLeft: spacing.lg + 4,
    marginTop: spacing.sm,
    marginRight: spacing.lg,
  },
});
