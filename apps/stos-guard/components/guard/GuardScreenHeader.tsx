import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { GuardGlyph } from "./GuardGlyphs";
import { spacing, textStyle } from "../../lib/design";

type Props = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
};

export function GuardScreenHeader({ title, subtitle, showBack, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      {showBack ? (
        <Pressable onPress={onBack || (() => router.back())} hitSlop={12} style={styles.back}>
          <GuardGlyph name="chevron-back" size={26} color="#fff" />
        </Pressable>
      ) : (
        <View style={styles.backSpacer} />
      )}
      <View style={styles.center}>
        <Text style={[textStyle("title3", "bold"), { color: "#fff", textAlign: "center" }]}>{title}</Text>
        {subtitle ? (
          <Text style={[textStyle("caption1"), { color: "#94A3B8", textAlign: "center", marginTop: 4 }]}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={styles.backSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", marginBottom: spacing.lg },
  back: { width: 40 },
  backSpacer: { width: 40 },
  center: { flex: 1 },
});
