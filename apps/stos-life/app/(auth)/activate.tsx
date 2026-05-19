import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Illustration } from "@stos/mobile-shared";
import { SystemLogo } from "../../components/brand/SystemLogo";
import { Screen } from "../../components/ui/Screen";
import { Input } from "../../components/ui/Input";
import { GradientButton } from "../../components/ui/GradientButton";
import { db, callFunction } from "../../lib/db";
import { useAuth } from "../../hooks/useAuth";
import { spacing, textStyle } from "../../lib/design";
import { useTheme } from "../../hooks/useTheme";

async function activateWithCode(code: string) {
  const normalized = code.trim().toUpperCase();
  const { data, error } = await db.rpc("activate_resident_with_code", { p_code: normalized });
  if (!error && data) return;
  const rpcMsg = error?.message || "";
  if (rpcMsg && !rpcMsg.includes("function") && !rpcMsg.includes("does not exist")) {
    throw new Error(rpcMsg);
  }
  await callFunction("life-handler", {
    method: "POST",
    query: { action: "activate" },
    body: { code: normalized },
  });
}

export default function ActivateScreen() {
  const { refreshResident } = useAuth();
  const { colors } = useTheme();
  const [code, setCode] = useState("STOS-DEMO-2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await activateWithCode(code);
      await refreshResident();
      router.replace("/(onboarding)");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kích hoạt thất bại";
      if (msg === "Request failed") {
        setError("Không gọi được server. Chạy SQL ACTIVATE_RESIDENT_RPC.sql trên Lovable.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Kích hoạt" subtitle="Nhập mã BQL đã cấp cho căn hộ của bạn">
      <View style={styles.hero}>
        <SystemLogo width={140} />
        <Illustration name="activate-code" width={120} height={100} />
      </View>
      <Input label="Mã kích hoạt" value={code} onChangeText={setCode} autoCapitalize="characters" />
      <Text style={[textStyle("footnote"), { color: colors.textSecondary }]}>Demo sau seed: STOS-DEMO-2026</Text>
      {error ? <Text style={[textStyle("footnote"), { color: colors.danger }]}>{error}</Text> : null}
      <GradientButton title="Kích hoạt" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
});
