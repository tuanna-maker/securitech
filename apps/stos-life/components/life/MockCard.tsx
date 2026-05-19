import { Pressable, View, StyleSheet, type ViewStyle } from "react-native";
import { mockCardStyle } from "@stos/mobile-shared";
import { useTheme } from "../../hooks/useTheme";
import { radii } from "../../lib/design";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  radius?: number;
  padded?: boolean;
};

/** Thẻ trắng/tối — viền mảnh + đổ bóng mềm như mockup */
export function MockCard({ children, onPress, style, radius = radii.xxl, padded = true }: Props) {
  const { colors, isDark } = useTheme();
  const cardStyle = [
    mockCardStyle({ isDark, backgroundColor: colors.card, borderColor: colors.border, radius }),
    padded && styles.pad,
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [...cardStyle, { opacity: pressed ? 0.94 : 1 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  pad: { padding: 16 },
});
