import { usePosts, useAnnouncements, useCommsStats } from "../../features/comms";
import { Screen } from "../ui/Screen";
import { KpiCard } from "../ui/Card";
import { ListRow } from "../ui/ListRow";
import { View, StyleSheet, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";

export function CommsScreen() {
  const { data: posts, isLoading, refetch, isRefetching } = usePosts();
  const { data: announcements } = useAnnouncements();
  const { data: stats } = useCommsStats();
  const { colors } = useTheme();

  return (
    <Screen title="Truyền thông" loading={isLoading} onRefresh={refetch} refreshing={isRefetching}>
      <View style={styles.kpiRow}>
        <KpiCard label="Bài đăng 7 ngày" value={stats?.postsThisWeek ?? 0} />
        <KpiCard label="Thông báo" value={stats?.totalAnnouncements ?? 0} />
      </View>
      <Text style={[styles.h, { color: colors.text }]}>Thông báo</Text>
      {(announcements ?? []).map((a) => (
        <ListRow key={a.id} title={a.title} subtitle={a.content?.slice(0, 100)} />
      ))}
      <Text style={[styles.h, { color: colors.text }]}>Bảng tin</Text>
      {(posts ?? []).map((p) => (
        <ListRow key={p.id} title={p.title} subtitle={p.content?.slice(0, 100)} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  h: { fontSize: 15, fontWeight: "600", marginVertical: 8 },
});
