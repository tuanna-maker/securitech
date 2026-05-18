import { useCourses, useTrainingStats } from "../../features/training";
import { Screen } from "../ui/Screen";
import { KpiCard } from "../ui/Card";
import { ListRow } from "../ui/ListRow";
import { View, StyleSheet } from "react-native";

export function TrainingScreen() {
  const { data: courses, isLoading, refetch, isRefetching } = useCourses();
  const { data: stats } = useTrainingStats();

  return (
    <Screen title="Đào tạo" loading={isLoading} onRefresh={refetch} refreshing={isRefetching}>
      <View style={styles.kpiRow}>
        <KpiCard label="Khóa học" value={stats?.totalCourses ?? 0} />
        <KpiCard label="Đăng ký" value={stats?.totalEnrollments ?? 0} />
      </View>
      {(courses ?? []).map((c) => (
        <ListRow key={c.id} title={c.title} subtitle={c.category ?? ""} right={`${c.duration_hours}h`} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({ kpiRow: { flexDirection: "row", gap: 8, marginBottom: 8 } });
