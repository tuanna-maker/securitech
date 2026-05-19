import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Image, Alert } from "react-native";
import { Screen } from "../../components/ui/Screen";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { callFunction } from "../../lib/db";
import { uploadIncidentPhoto } from "../../lib/uploadImage";
import { spacing } from "../../lib/design";

export default function NewIncidentScreen() {
  const { resident } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    let ImagePicker: typeof import("expo-image-picker");
    try {
      ImagePicker = await import("expo-image-picker");
    } catch {
      Alert.alert("Expo Go", "Thêm ảnh cần development build (npm run ios:install).");
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const pick = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!pick.canceled && pick.assets[0]) setPhotoUri(pick.assets[0].uri);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const res = await callFunction<{ id: string }>("service-handler", {
        method: "POST",
        query: { type: "support" },
        body: {
          building_id: resident!.building_id,
          resident_id: resident!.id,
          title,
          description,
          category: "incident",
          priority: "high",
          priority_tier: "high",
        },
      });
      const id = (res as { id?: string })?.id;
      if (photoUri && id) {
        try {
          await uploadIncidentPhoto(photoUri, id);
        } catch {
          /* attachment optional */
        }
      }
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Báo sự cố">
      <Input label="Tiêu đề" value={title} onChangeText={setTitle} placeholder="Mô tả ngắn" />
      <Input label="Chi tiết" value={description} onChangeText={setDescription} placeholder="Mô tả chi tiết" multiline />
      <Button title={photoUri ? "Đổi ảnh đính kèm" : "Thêm ảnh"} variant="outline" onPress={pickPhoto} style={{ marginTop: spacing.sm }} />
      {photoUri ? <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" /> : null}
      <Button title="Gửi báo cáo" onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { width: "100%", height: 160, borderRadius: 12, marginTop: spacing.md },
});
