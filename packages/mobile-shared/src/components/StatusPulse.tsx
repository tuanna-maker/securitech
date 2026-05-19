import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

/** Pulsing ring for SOS / live status (Reanimated — no Lottie file required). */
export function StatusPulse({ color = "#EF4444", size = 120 }: { color?: string; size?: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.35, { duration: 900 }), -1, true);
    opacity.value = withRepeat(withTiming(0.15, { duration: 900 }), -1, true);
  }, [opacity, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: color }, ringStyle]} />
      <View style={[styles.core, { width: size * 0.55, height: size * 0.55, borderRadius: size * 0.275, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderWidth: 3 },
  core: {},
});
