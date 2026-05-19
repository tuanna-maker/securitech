import { View, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.line, { backgroundColor: colors.fill }]} />
          <View style={[styles.line, styles.short, { backgroundColor: colors.fill }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { gap: 8 },
  line: { height: 14, borderRadius: 6, width: "100%" },
  short: { width: "60%" },
});
