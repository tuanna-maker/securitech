import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Alert } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Avatar, uploadImageFromUri } from "@stos/mobile-shared";
import { Screen } from "../../components/ui/Screen";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { ListRow } from "../../components/ui/ListRow";
import { Button } from "../../components/ui/Button";
import { SkeletonList } from "../../components/shared/SkeletonList";
import { useAuth } from "../../hooks/useAuth";
import { callFunction, db } from "../../lib/db";
import { spacing } from "../../lib/design";

export default function AccountScreen() {
  const { staff, signOut, onDuty, user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(staff?.avatar_url);

  const { data: payroll, isLoading } = useQuery({
    queryKey: ["payroll", staff?.id],
    enabled: !!staff?.id,
    queryFn: () => callFunction<{ items?: { period: string; amount: number }[] }>("finance-handler", { query: { type: "payroll", staff_id: staff!.id } }),
  });

  const pickAvatar = async () => {
    if (!user || !staff) return;
    let ImagePicker: typeof import("expo-image-picker");
    try {
      ImagePicker = await import("expo-image-picker");
    } catch {
      Alert.alert("Cần bản cài native", "Dùng npm run ios:install thay vì Expo Go.");
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const pick = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (pick.canceled || !pick.assets[0]) return;
    setUploading(true);
    try {
      const url = await uploadImageFromUri(db, {
        bucket: "avatars",
        path: `${user.id}/avatar.webp`,
        uri: pick.assets[0].uri,
      });
      await db.from("staff_members").update({ avatar_url: url }).eq("id", staff.id);
      setAvatarUrl(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Screen title="Tài khoản">
      <View style={styles.avatarWrap}>
        <Avatar uri={avatarUrl} name={staff?.name} size="lg" />
        <Button title={uploading ? "Đang tải…" : "Đổi ảnh"} variant="plain" onPress={pickAvatar} />
      </View>
      <GroupedSection>
        <ListRow title={staff?.name || "—"} subtitle={staff?.role} />
        <ListRow title="Trạng thái ca" subtitle={onDuty ? "Đang trực" : "Chưa điểm danh"} isLast />
      </GroupedSection>
      <GroupedSection title="Lương (chỉ xem)">
        {isLoading ? <SkeletonList rows={2} /> : (payroll?.items ?? []).map((p, i) => (
          <ListRow key={p.period} title={p.period} right={`${p.amount}`} isLast={i === (payroll?.items?.length ?? 0) - 1} />
        ))}
      </GroupedSection>
      <Button title="Đăng xuất" variant="outline" onPress={signOut} style={{ marginTop: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
});
