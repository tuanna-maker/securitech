import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { brand } from "../../lib/brand";
import { spacing, textStyle } from "../../lib/design";

export function SectionTitle({ title, link, onLink }: { title: string; link?: string; onLink?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[textStyle("caption1", "semibold"), { color: colors.textTertiary, letterSpacing: 0.6 }]}>{title}</Text>
      {link && onLink ? (
        <Pressable onPress={onLink}>
          <Text style={[textStyle("caption1", "semibold"), { color: brand.navyLight }]}>{link}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.lg, marginBottom: spacing.sm },
});
