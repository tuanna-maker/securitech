import { Children, ReactElement, ReactNode, cloneElement, isValidElement } from "react";
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
  const rows = Children.toArray(children);
  const groupedChildren = rows.map((child, index) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{ isLast?: boolean }>;
    return cloneElement(el, {
      key: el.key ?? `grouped-row-${index}`,
      isLast: index === rows.length - 1,
    });
  });

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
        {groupedChildren}
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
