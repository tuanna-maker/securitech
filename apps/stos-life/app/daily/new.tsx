import { useState } from "react";
import { router } from "expo-router";
import { Screen } from "../../components/ui/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { callFunction } from "../../lib/db";
import { spacing } from "../../lib/design";

export default function DailyRequestScreen() {
  const { resident } = useAuth();
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await callFunction("service-handler", {
        method: "POST",
        query: { type: "quick" },
        body: {
          building_id: resident!.building_id,
          resident_id: resident!.id,
          service_type: serviceType,
          description,
        },
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Yêu cầu hàng ngày">
      <Input label="Loại dịch vụ" value={serviceType} onChangeText={setServiceType} placeholder="VD: Giao nước" />
      <Input label="Ghi chú" value={description} onChangeText={setDescription} placeholder="Chi tiết" multiline />
      <Button title="Gửi yêu cầu" onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}
