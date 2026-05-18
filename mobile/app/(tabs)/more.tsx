import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MODULES } from "../../constants/modules";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "../../components/ui/Button";

export default function MoreScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { colors } = useTheme();

  const groups = [...new Set(MODULES.filter((m) => m.id !== "dashboard").map((m) => m.group))];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Menu</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          {profile?.full_name ?? "Người dùng"}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {groups.map((group) => (
          <View key={group}>
            <Text style={[styles.group, { color: colors.textSecondary }]}>{group}</Text>
            {MODULES.filter((m) => m.group === group && !["dashboard", "buildings", "incidents"].includes(m.id)).map(
              (m) => (
                <Pressable
                  key={m.id}
                  onPress={() => router.push(`/module/${m.id}`)}
                  style={({ pressed }) => [
                    styles.item,
                    { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Text style={[styles.itemText, { color: colors.text }]}>{m.label}</Text>
                  <Text style={{ color: colors.textSecondary }}>›</Text>
                </Pressable>
              )
            )}
          </View>
        ))}
        <Button
          title="Đăng xuất"
          variant="outline"
          onPress={async () => {
            await signOut();
            router.replace("/login");
          }}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: "700" },
  scroll: { padding: 16, paddingBottom: 32 },
  group: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", marginTop: 12, marginBottom: 8 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemText: { fontSize: 15, fontWeight: "500" },
});
