import { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { spacing, textStyle } from "../../lib/design";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  scroll?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  action?: ReactNode;
  largeTitle?: boolean;
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
  largeTitle = true,
}: Props) {
  const { colors } = useTheme();

  const content = loading ? (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.tint} />
    </View>
  ) : scroll ? (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
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
      {title ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text
              style={[
                largeTitle ? textStyle("largeTitle", "bold") : textStyle("title3", "bold"),
                { color: colors.text },
              ]}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text style={[textStyle("subhead"), { color: colors.textSecondary, marginTop: 4 }]}>{subtitle}</Text>
            ) : null}
          </View>
          {action}
        </View>
      ) : null}
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === "ios" ? spacing.sm : spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerText: { flex: 1 },
  /** Tab bar nổi ~88pt — cần padding đủ để cuộn thấy hết nội dung */
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 128, flexGrow: 1 },
  body: { flex: 1, padding: spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
});
