import { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useHaptics } from "../hooks/useHaptics";

type Props = {
  label?: string;
  sublabel?: string;
  holdMs?: number;
  onTriggered: () => void;
  color?: string;
};

/** Hold-to-activate SOS — Apple HIG + BR-GUARD-03 / LIFE-UC-016 */
export function SOSHoldButton({
  label = "SOS",
  sublabel = "Giữ 3 giây",
  holdMs = 3000,
  onTriggered,
  color = "#EF4444",
}: Props) {
  const haptics = useHaptics();
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    let p = 0;
    timer.current = setInterval(() => {
      p += 100;
      setProgress(p);
      if (p >= holdMs) {
        if (timer.current) clearInterval(timer.current);
        haptics.error();
        onTriggered();
        setProgress(0);
      }
    }, 100);
  };

  const end = () => {
    if (timer.current) clearInterval(timer.current);
    setProgress(0);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        onPressIn={start}
        onPressOut={end}
        style={({ pressed }) => [styles.btn, { backgroundColor: color, opacity: pressed ? 0.9 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.sub}>{sublabel}</Text>
      </Pressable>
      {progress > 0 ? (
        <Text style={styles.pct}>{Math.min(100, Math.round((progress / holdMs) * 100))}%</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 12 },
  btn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: "#fff", fontSize: 28, fontWeight: "700" },
  sub: { color: "#fff", fontSize: 13, marginTop: 4 },
  pct: { fontSize: 12, color: "#666" },
});
