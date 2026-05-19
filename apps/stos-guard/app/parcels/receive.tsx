import { useState } from "react";
import { Screen } from "../../components/ui/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { db, functionsUrl } from "../../lib/db";

export default function ParcelReceiveScreen() {
  const { staff } = useAuth();
  const [apartment, setApartment] = useState("");
  const [sender, setSender] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const { data: resident } = await db
        .from("residents")
        .select("id")
        .eq("building_id", staff!.building_id!)
        .eq("apartment", apartment.trim())
        .maybeSingle();

      const { data: { session } } = await db.auth.getSession();
      await fetch(`${functionsUrl}/access-handler?action=parcels`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session!.access_token}` },
        body: JSON.stringify({
          building_id: staff!.building_id,
          resident_id: resident?.id,
          sender,
          received_by: staff!.name,
        }),
      });
      setApartment("");
      setSender("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Nhận bưu phẩm">
      <Input label="Căn hộ" value={apartment} onChangeText={setApartment} />
      <Input label="Người gửi" value={sender} onChangeText={setSender} />
      <Button title="Ghi nhận" onPress={submit} loading={loading} style={{ marginTop: 16 }} />
    </Screen>
  );
}
