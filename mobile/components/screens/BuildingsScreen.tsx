import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Screen } from "../ui/Screen";
import { Input } from "../ui/Input";
import { ListRow } from "../ui/ListRow";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useBuildings } from "../../features/buildings";
import { updateBuilding } from "../../features/buildings/api";

export function BuildingsScreen() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const { data, isLoading, refetch, isRefetching } = useBuildings({ search, limit: 100 });

  const saveCover = async () => {
    if (!selectedId || !coverUrl.trim()) return;
    setSaving(true);
    try {
      await updateBuilding(selectedId, { cover_image_url: coverUrl.trim() });
      Alert.alert("Đã lưu", "Ảnh cover tòa nhà cập nhật cho STOS Life.");
      setCoverUrl("");
      setSelectedId(null);
      refetch();
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Không lưu được");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      title="Tòa nhà"
      subtitle={`${data?.total ?? 0} tòa nhà`}
      loading={isLoading}
      onRefresh={refetch}
      refreshing={isRefetching}
    >
      <Input label="Tìm kiếm" placeholder="Tên, địa chỉ..." value={search} onChangeText={setSearch} />
      {selectedId ? (
        <View style={styles.coverBox}>
          <Input label="URL ảnh cover (STOS Life hero)" value={coverUrl} onChangeText={setCoverUrl} placeholder="https://..." />
          <Button title={saving ? "Đang lưu…" : "Lưu cover"} onPress={saveCover} disabled={saving} />
          <Button title="Huỷ" variant="plain" onPress={() => setSelectedId(null)} />
        </View>
      ) : null}
      {data?.data.map((b) => (
        <View key={b.id}>
          <ListRow
            title={b.name}
            subtitle={[b.address, b.region, b.cover_image_url ? "Đã có cover" : null].filter(Boolean).join(" · ")}
            right={`SLA ${b.sla_percent}%`}
            onPress={() => {
              setSelectedId(b.id);
              setCoverUrl(b.cover_image_url || "");
            }}
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
  coverBox: { marginBottom: 16, gap: 8 },
});
