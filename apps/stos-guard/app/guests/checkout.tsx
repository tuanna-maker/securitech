import { useState } from "react";
import { router } from "expo-router";
import { Screen } from "../../components/ui/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { callFunction } from "../../lib/db";
import { spacing } from "../../lib/design";

export default function GuestCheckoutScreen() {
  const [accessLogId, setAccessLogId] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await callFunction("access-handler", {
        method: "POST",
        query: { action: "checkout" },
        body: { access_log_id: accessLogId },
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Khách ra">
      <Input label="Mã access log" value={accessLogId} onChangeText={setAccessLogId} />
      <Button title="Xác nhận ra" onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}
