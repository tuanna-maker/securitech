import { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useHaptics } from "../../hooks/useHaptics";

export function SOSHoldButton({ onTriggered, color = "#EF4444" }: { onTriggered: () => void; color?: string }) {
  const haptics = useHaptics();
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdMs = 3000;

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
      <Pressable onPressIn={start} onPressOut={end} style={({ pressed }) => [styles.btn, { backgroundColor: color, opacity: pressed ? 0.9 : 1 }]}>
        <Text style={styles.label}>SOS</Text>
        <Text style={styles.sub}>Giữ 3 giây</Text>
      </Pressable>
      {progress > 0 ? <Text style={styles.pct}>{Math.min(100, Math.round((progress / holdMs) * 100))}%</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  btn: { width: 200, height: 200, borderRadius: 100, alignItems: "center", justifyContent: "center" },
  label: { color: "#fff", fontSize: 28, fontWeight: "700" },
  sub: { color: "#fff", fontSize: 13, marginTop: 4 },
  pct: { fontSize: 12, color: "#666" },
});
