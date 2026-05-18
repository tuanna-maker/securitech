import { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  action?: ReactNode;
};

export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
  loading,
  onRefresh,
  refreshing,
  action,
}: Props) {
  const { colors } = useTheme();

  const content = loading ? (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.secondary} />
    </View>
  ) : scroll ? (
    <ScrollView
      contentContainerStyle={styles.scroll}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.body}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.sub, { color: colors.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
        {action}
      </View>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700" },
  sub: { fontSize: 13, marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 32 },
  body: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
});
