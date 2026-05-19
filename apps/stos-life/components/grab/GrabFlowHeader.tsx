import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { brand, gradients } from "../../lib/brand";
import { radii, spacing, textStyle } from "../../lib/design";

export function GrabFlowHeader({
  title,
  subtitle,
  icon = "shield",
  accent = "grab",
}: {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accent?: "grab" | "primary";
}) {
  const colors = accent === "grab" ? gradients.grab : gradients.primary;

  return (
    <LinearGradient colors={[...colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color="#fff" />
      </View>
      <View style={styles.text}>
        <Text style={[textStyle("title3", "bold"), styles.title]}>{title}</Text>
        <Text style={[textStyle("subhead"), styles.sub]}>{subtitle}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1 },
  title: { color: "#fff" },
  sub: { color: "rgba(255,255,255,0.92)", marginTop: 4 },
});
