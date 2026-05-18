import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Screen } from "../ui/Screen";
import { ListRow } from "../ui/ListRow";
import { Badge } from "../ui/Badge";
import { useIncidents } from "../../features/incidents";

export function IncidentsScreen() {
  const [status, setStatus] = useState<string | undefined>();
  const { data, isLoading, refetch, isRefetching } = useIncidents({ status });

  return (
    <Screen
      title="Sự cố"
      subtitle="Quản lý sự cố"
      loading={isLoading}
      onRefresh={refetch}
      refreshing={isRefetching}
    >
      {data?.data.map((inc) => (
        <View key={inc.id}>
          <ListRow
            title={inc.type}
            subtitle={`${(inc as { buildings?: { name: string } }).buildings?.name ?? ""} · ${inc.description?.slice(0, 80) ?? ""}`}
          />
          <View style={styles.badges}>
            <Badge label={inc.severity} status={inc.severity === "critical" ? "critical" : "warning"} />
            <Badge label={inc.status} status={inc.status} />
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: "row", gap: 6, marginBottom: 8, marginLeft: 4 },
});
