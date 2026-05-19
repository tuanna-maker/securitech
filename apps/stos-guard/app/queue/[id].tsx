import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { subscribeRequestUpdates } from "@stos/mobile-shared";
import { Screen } from "../../components/ui/Screen";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { callFunction, db } from "../../lib/db";

export default function QueueDetailScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source: string }>();
  const table = source === "support" ? "support_requests" : "quick_service_requests";
  const [note, setNote] = useState("");
  const qc = useQueryClient();

  useEffect(() => {
    if (!id) return;
    const ch = subscribeRequestUpdates(db, id, table, () => qc.invalidateQueries({ queryKey: ["req", id] }));
    return () => { db.removeChannel(ch); };
  }, [id, table, qc]);

  const { data: req, refetch } = useQuery({
    queryKey: ["req", id],
    queryFn: async () => {
      const { data } = await db.from(table).select("*, residents(full_name, apartment, phone)").eq("id", id).single();
      return data;
    },
  });

  const accept = async () => {
    await callFunction("guard-handler", {
      method: "POST",
      query: { action: "accept" },
      body: { request_id: id, source: source || "quick" },
    });
    refetch();
  };

  const transition = async (to_status: string) => {
    await callFunction("guard-handler", {
      method: "POST",
      query: { action: "transition" },
      body: { request_id: id, source: source || "quick", to_status, completion_note: note },
    });
    if (to_status === "completed") router.back();
    else refetch();
  };

  const status = req?.app_status || "submitted";
  const resident = req?.residents as { full_name?: string; apartment?: string } | null;

  return (
    <Screen title="Chi tiết" subtitle={resident ? `${resident.full_name} · ${resident.apartment}` : ""}>
      {status === "submitted" || status === "escalated" ? <Button title="Nhận việc" onPress={accept} /> : null}
      {status === "accepted" ? <Button title="Bắt đầu đi" onPress={() => transition("en_route")} style={{ marginTop: 8 }} /> : null}
      {status === "en_route" ? <Button title="Đã tới" onPress={() => transition("on_site")} style={{ marginTop: 8 }} /> : null}
      {status === "on_site" ? (
        <>
          <Input label="Ghi chú" value={note} onChangeText={setNote} style={{ marginTop: 8 }} />
          <Button title="Hoàn thành" onPress={() => transition("completed")} style={{ marginTop: 8 }} />
        </>
      ) : null}
    </Screen>
  );
}
