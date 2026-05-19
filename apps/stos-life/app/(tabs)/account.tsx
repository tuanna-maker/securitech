import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Avatar } from "@stos/mobile-shared";
import { Screen } from "../../components/ui/Screen";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { ListRow } from "../../components/ui/ListRow";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { uploadAvatar } from "../../lib/uploadImage";
import { spacing } from "../../lib/design";

export default function AccountScreen() {
  const { resident, user, signOut, refreshResident } = useAuth();
  const [uploading, setUploading] = useState(false);

  const pickAvatar = async () => {
    if (!user) return;
    let ImagePicker: typeof import("expo-image-picker");
    try {
      ImagePicker = await import("expo-image-picker");
    } catch {
      Alert.alert("Cần bản cài native", "Đổi ảnh đại diện cần development build (npm run ios:install), không hỗ trợ đầy đủ trên Expo Go.");
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const pick = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (pick.canceled || !pick.assets[0]) return;
    setUploading(true);
    try {
      await uploadAvatar(pick.assets[0].uri, user.id);
      await refreshResident();
    } finally {
      setUploading(false);
    }
  };

  return (
    <Screen title="Tài khoản">
      <View style={styles.avatarWrap}>
        <Avatar uri={resident?.avatar_url} name={resident?.full_name} size="lg" />
        <Button title={uploading ? "Đang tải…" : "Đổi ảnh"} variant="plain" onPress={pickAvatar} disabled={uploading} />
      </View>
      <GroupedSection>
        <ListRow title={resident?.full_name || "—"} subtitle={`Căn ${resident?.apartment}`} />
        <ListRow title="SĐT" subtitle={resident?.phone || "—"} isLast />
      </GroupedSection>
      <Button title="Đăng xuất" variant="outline" onPress={signOut} style={{ marginTop: 24 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
});
