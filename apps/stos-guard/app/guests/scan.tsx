import { useState } from "react";
import { TextInput, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Screen } from "../../components/ui/Screen";
import { Button } from "../../components/ui/Button";
import { callFunction } from "../../lib/db";
import { spacing } from "../../lib/design";

export default function GuestScanScreen() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const checkIn = async () => {
    setLoading(true);
    try {
      await callFunction("guard-handler", {
        method: "POST",
        query: { action: "checkin-visitor" },
        body: { qr_token: token.trim() },
      });
      setMsg("Check-in thành công");
      setTimeout(() => router.back(), 1000);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Quét QR khách" subtitle="Nhập mã hoặc quét (camera phase 2)">
      <TextInput
        value={token}
        onChangeText={setToken}
        placeholder="STOS:XXXXXXXX"
        style={styles.input}
        autoCapitalize="characters"
      />
      {msg ? <Button title={msg} onPress={() => {}} variant="plain" disabled /> : null}
      <Button title="Check-in" onPress={checkIn} loading={loading} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 14, fontSize: 17 },
});
