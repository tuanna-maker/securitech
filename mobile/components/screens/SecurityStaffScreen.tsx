import { View, StyleSheet } from "react-native";
import { Screen } from "../ui/Screen";
import { ListRow } from "../ui/ListRow";
import { Badge } from "../ui/Badge";
import { useQuery } from "@tanstack/react-query";
import { db } from "../../lib/db";

export function SecurityStaffScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["staff_members"],
    queryFn: async () => {
      const { data: rows, error } = await db
        .from("staff_members")
        .select("*, buildings(name)")
        .order("name")
        .limit(100);
      if (error) throw error;
      return rows ?? [];
    },
  });

  return (
    <Screen title="Nhân sự bảo vệ" loading={isLoading} onRefresh={refetch} refreshing={isRefetching}>
      {(data ?? []).map((s) => (
        <View key={s.id}>
          <ListRow
            title={s.name}
            subtitle={`${s.role} · ${(s as { buildings?: { name: string } }).buildings?.name ?? "Chưa gán tòa"}`}
          />
          <View style={styles.badges}>
            <Badge label={s.status} status={s.status === "offline" ? "offline" : "active"} />
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: "row", gap: 6, marginBottom: 8, marginLeft: 4 },
});
