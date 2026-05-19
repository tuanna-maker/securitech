import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { brand } from "../../lib/brand";
import { spacing, textStyle } from "../../lib/design";

export function SectionHeader({ title, linkLabel, onLink }: { title: string; linkLabel?: string; onLink?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[textStyle("footnote", "semibold"), { color: colors.textTertiary }]}>{title}</Text>
      {linkLabel && onLink ? (
        <Pressable onPress={onLink}>
          <Text style={[textStyle("footnote", "semibold"), { color: brand.navyLight }]}>{linkLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm, marginTop: spacing.md },
});
