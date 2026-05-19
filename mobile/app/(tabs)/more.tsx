import { Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MODULES } from "../../constants/modules";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { ListRow } from "../../components/ui/ListRow";
import { spacing, textStyle } from "../../lib/design";

const MODULE_ICONS: Record<string, "people" | "school" | "card" | "chatbubbles" | "shield" | "document-text"> = {
  workforce: "people",
  training: "school",
  finance: "card",
  comms: "chatbubbles",
  access: "shield",
  reports: "document-text",
};

export default function MoreScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { colors } = useTheme();

  const groups = [...new Set(MODULES.filter((m) => m.id !== "dashboard").map((m) => m.group))];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <Text style={[textStyle("largeTitle", "bold"), styles.title, { color: colors.text }]}>
        Thêm
      </Text>
      <Text style={[textStyle("subhead"), styles.subtitle, { color: colors.textSecondary }]}>
        {profile?.full_name ?? "Người dùng"}
      </Text>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {groups.map((group) => {
          const items = MODULES.filter(
            (m) => m.group === group && !["dashboard", "buildings", "incidents"].includes(m.id)
          );
          if (items.length === 0) return null;
          return (
            <GroupedSection key={group} title={group}>
              {items.map((m, i) => (
                <ListRow
                  key={m.id}
                  title={m.label}
                  icon={MODULE_ICONS[m.id] ?? "apps"}
                  onPress={() => router.push(`/module/${m.id}`)}
                  isLast={i === items.length - 1}
                />
              ))}
            </GroupedSection>
          );
        })}

        <GroupedSection>
          <ListRow
            title="Đăng xuất"
            icon="log-out-outline"
            onPress={async () => {
              await signOut();
              router.replace("/login");
            }}
            isLast
          />
        </GroupedSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  subtitle: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
});
