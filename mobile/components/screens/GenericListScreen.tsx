import { Screen } from "../ui/Screen";
import { ListRow } from "../ui/ListRow";
import { Badge } from "../ui/Badge";
import { View, StyleSheet } from "react-native";

type Item = {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeStatus?: string;
};

export function GenericListScreen({
  title,
  subtitle,
  items,
  loading,
  onRefresh,
  refreshing,
}: {
  title: string;
  subtitle?: string;
  items: Item[];
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <Screen
      title={title}
      subtitle={subtitle}
      loading={loading}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      {items.length === 0 ? (
        <ListRow title="Không có dữ liệu" subtitle="Thử làm mới hoặc kiểm tra quyền tenant" />
      ) : (
        items.map((item) => (
          <View key={item.id}>
            <ListRow title={item.title} subtitle={item.subtitle} />
            {item.badge ? (
              <View style={styles.badges}>
                <Badge label={item.badge} status={item.badgeStatus} />
              </View>
            ) : null}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: { marginBottom: 8, marginLeft: 4 },
});
