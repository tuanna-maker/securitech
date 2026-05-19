import { View, StyleSheet } from "react-native";

/** MOBILE_UIUX_GUIDELINES §5.2 — skeleton instead of spinner for lists */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.line} />
          <View style={[styles.line, styles.short]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, padding: 16 },
  row: { gap: 8 },
  line: { height: 14, backgroundColor: "#E2E8F0", borderRadius: 6, width: "100%" },
  short: { width: "60%" },
});
