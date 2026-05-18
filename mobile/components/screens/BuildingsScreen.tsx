import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Screen } from "../ui/Screen";
import { Input } from "../ui/Input";
import { ListRow } from "../ui/ListRow";
import { Badge } from "../ui/Badge";
import { useBuildings } from "../../features/buildings";

export function BuildingsScreen() {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch, isRefetching } = useBuildings({ search, limit: 100 });

  return (
    <Screen
      title="Tòa nhà"
      subtitle={`${data?.total ?? 0} tòa nhà`}
      loading={isLoading}
      onRefresh={refetch}
      refreshing={isRefetching}
    >
      <Input
        label="Tìm kiếm"
        placeholder="Tên, địa chỉ..."
        value={search}
        onChangeText={setSearch}
      />
      {data?.data.map((b) => (
        <View key={b.id}>
          <ListRow
            title={b.name}
            subtitle={[b.address, b.region].filter(Boolean).join(" · ")}
            right={`SLA ${b.sla_percent}%`}
          />
          <View style={styles.badges}>
            <Badge label={b.status} status={b.status} />
            <Badge label={`${b.incidents_today} sự cố`} status={b.incidents_today > 0 ? "warning" : "normal"} />
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: "row", gap: 6, marginTop: -4, marginBottom: 8, marginLeft: 4 },
});
