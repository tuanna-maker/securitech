import { useState } from "react";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, QueryErrorState, copy, trackEvent } from "@stos/mobile-shared";
import { Screen } from "../../components/ui/Screen";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { ListRow } from "../../components/ui/ListRow";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { SkeletonList } from "../../components/shared/SkeletonList";
import { callFunction } from "../../lib/db";
import { useAuth } from "../../hooks/useAuth";

export default function GuestsScreen() {
  const { resident } = useAuth();
  const [mode, setMode] = useState<"list" | "new">("list");
  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [qr, setQr] = useState<{ display_code: string; qr_payload: string } | null>(null);

  const { data: invites, refetch, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["invites"],
    queryFn: () => callFunction<{ data: unknown[] }>("life-handler", { query: { action: "visitor-invite" } }),
  });

  const list = ((invites as { data?: { id: string; visitor_name: string; status: string }[] })?.data || []);

  const create = async () => {
    const res = await callFunction<{ display_code: string; qr_payload: string }>("life-handler", {
      method: "POST",
      query: { action: "visitor-invite" },
      body: {
        visitor_name: name,
        visit_start: start || new Date().toISOString(),
        visit_end: end || new Date(Date.now() + 4 * 3600000).toISOString(),
      },
    });
    setQr(res as { display_code: string; qr_payload: string });
    setMode("list");
    refetch();
  };

  if (qr) {
    return (
      <Screen title="Mã khách" subtitle={qr.display_code}>
        <Button title="Xong" onPress={() => setQr(null)} />
      </Screen>
    );
  }

  if (mode === "new") {
    return (
      <Screen title="Đăng ký khách">
        <Input label="Tên khách" value={name} onChangeText={setName} />
        <Input label="Giờ đến (ISO)" value={start} onChangeText={setStart} placeholder="2026-05-18T10:00:00Z" />
        <Input label="Giờ ra (ISO)" value={end} onChangeText={setEnd} />
        <Button title="Tạo QR" onPress={create} style={{ marginTop: 16 }} />
        <Button title="Huỷ" variant="plain" onPress={() => setMode("list")} />
      </Screen>
    );
  }

  return (
    <Screen title="Khách ra vào" action={<Button title="Đăng ký" variant="plain" onPress={() => setMode("new")} />}>
      {isLoading ? <SkeletonList /> : null}
      {isError ? <QueryErrorState onRetry={() => refetch()} timeout={(error as Error)?.message?.includes("timeout")} /> : null}
      {!isLoading && !isError && list.length === 0 ? (
        <EmptyState
          illustration="empty-guests"
          title={copy.empty.guests.title}
          subtitle={copy.empty.guests.subtitle}
          actionLabel="Đăng ký khách"
          onAction={() => {
            trackEvent("empty_state_view", { screen: "guests" });
            setMode("new");
          }}
        />
      ) : null}
      {!isLoading && !isError && list.length > 0 ? (
        <GroupedSection>
          {list.map((inv, i, arr) => (
            <ListRow key={inv.id} title={inv.visitor_name} subtitle={inv.status} isLast={i === arr.length - 1} />
          ))}
        </GroupedSection>
      ) : null}
    </Screen>
  );
}
