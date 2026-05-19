import { View, Text, Pressable, StyleSheet } from "react-native";
import { StosIcon, softCardShadow, type StosIconName } from "@stos/mobile-shared";
import { useTheme } from "../../hooks/useTheme";
import { textStyle } from "../../lib/design";

type Props = {
  name: StosIconName;
  label: string;
  bg: string;
  color: string;
  onPress: () => void;
};

/** Nút vuông trong profile card — nền trắng + bóng nhẹ */
export function QuickActionButton({ name, label, bg, color, onPress }: Props) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, { opacity: pressed ? 0.92 : 1 }]}>
      <View style={[styles.btn, { backgroundColor: colors.card, borderColor: colors.border }, softCardShadow(isDark)]}>
        <View style={[styles.icon, { backgroundColor: bg }]}>
          <StosIcon name={name} size={24} color={color} variant="filled" />
        </View>
      </View>
      <Text style={[textStyle("caption2"), { color: colors.text, textAlign: "center" }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "23%", alignItems: "center", gap: 8 },
  btn: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 72,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
