import { View, StyleSheet } from "react-native";
import { LifeGradientIcon, type LifeGradientIconName } from "./LifeGradientIcon";

/** Icon nhỏ trong thẻ quản lý — cùng bộ gradient 3D */
export function MgmtGradientIcon({ name, size = 40 }: { name: LifeGradientIconName; size?: number }) {
  return (
    <View style={styles.wrap}>
      <LifeGradientIcon name={name} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
