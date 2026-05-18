import { View, StyleSheet } from "react-native";
import { Screen } from "../ui/Screen";
import { ListRow } from "../ui/ListRow";
import { Badge } from "../ui/Badge";
import { useSOSCalls } from "../../features/residents";

export function SOSScreen() {
  const { data, isLoading, refetch, isRefetching } = useSOSCalls();

  return (
    <Screen title="SOS khẩn cấp" loading={isLoading} onRefresh={refetch} refreshing={isRefetching}>
      {(data ?? []).map((call) => (
        <View key={call.id}>
          <ListRow
            title={call.caller_name || "Khẩn cấp"}
            subtitle={[call.caller_phone, call.location_description].filter(Boolean).join(" · ")}
          />
          <View style={styles.badges}>
            <Badge label={call.status} status={call.status === "pending" ? "critical" : "active"} />
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: "row", gap: 6, marginBottom: 8, marginLeft: 4 },
});
