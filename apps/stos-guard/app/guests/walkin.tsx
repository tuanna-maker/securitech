import { useState } from "react";
import { router } from "expo-router";
import { Screen } from "../../components/ui/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { callFunction } from "../../lib/db";
import { spacing } from "../../lib/design";

export default function WalkInGuestScreen() {
  const { staff } = useAuth();
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await callFunction("access-handler", {
        method: "POST",
        query: { action: "walkin" },
        body: { building_id: staff?.building_id, visitor_name: name, purpose },
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Khách vãng lai">
      <Input label="Họ tên" value={name} onChangeText={setName} />
      <Input label="Mục đích" value={purpose} onChangeText={setPurpose} />
      <Button title="Ghi nhận vào" onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}
