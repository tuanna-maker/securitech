import { View, StyleSheet } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[styles.line, { backgroundColor: colors.fill }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { gap: 12, padding: 16 }, line: { height: 14, borderRadius: 6 } });
