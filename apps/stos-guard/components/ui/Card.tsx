import { ReactNode } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { cardShadow, radii, spacing, textStyle } from "../../lib/design";

export function Card({
  title,
  children,
  style,
}: {
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.groupedBackground },
        cardShadow(isDark),
        style,
      ]}
    >
      {title ? (
        <Text style={[textStyle("headline", "semibold"), { color: colors.text, marginBottom: spacing.sm }]}>
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: string | number;
  delta?: string;
  accent?: string;
}) {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={[
        styles.kpi,
        { backgroundColor: colors.groupedBackground },
        cardShadow(isDark),
      ]}
    >
      <Text style={[textStyle("caption1"), { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[textStyle("title2", "bold"), { color: accent || colors.text, marginTop: 4 }]}>
        {value}
      </Text>
      {delta ? (
        <Text style={[textStyle("caption2"), { color: colors.textTertiary, marginTop: 2 }]}>{delta}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  kpi: {
    flex: 1,
    minWidth: "45%",
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
});
