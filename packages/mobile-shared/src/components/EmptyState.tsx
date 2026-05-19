import { View, Text, StyleSheet, Pressable } from "react-native";
import { Illustration, type IllustrationName } from "../illustrations/Illustration";

type Props = {
  illustration: IllustrationName;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Dark hero backgrounds — slightly dim illustration */
  onDark?: boolean;
};

export function EmptyState({ illustration, title, subtitle, actionLabel, onAction, onDark }: Props) {
  return (
    <View style={styles.wrap}>
      <Illustration name={illustration} width={140} height={116} opacity={onDark ? 0.88 : 1} />
      <Text style={[styles.title, onDark && styles.titleDark]}>{title}</Text>
      {subtitle ? <Text style={[styles.sub, onDark && styles.subDark]}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.btn} accessibilityRole="button">
          <Text style={styles.btnText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 24 },
  title: { fontSize: 17, fontWeight: "600", color: "#1E3066", marginTop: 16, textAlign: "center" },
  titleDark: { color: "#FFFFFF" },
  sub: { fontSize: 15, color: "#3C3C43", marginTop: 8, textAlign: "center", lineHeight: 20 },
  subDark: { color: "rgba(255,255,255,0.85)" },
  btn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: "#1E3066" },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
