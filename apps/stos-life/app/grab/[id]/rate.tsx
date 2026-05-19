import { useState } from "react";
import { View, Pressable, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { Screen } from "../../../components/ui/Screen";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { callFunction } from "../../../lib/db";
import { useTheme } from "../../../hooks/useTheme";
import { spacing, textStyle } from "../../../lib/design";

export default function RateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await callFunction("life-handler", {
        method: "POST",
        query: { action: "rate" },
        body: { request_id: id, request_type: "quick", stars, comment },
      });
      if (Platform.OS === "ios") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Đánh giá dịch vụ" subtitle="Cảm ơn bạn đã dùng STOS Life">
      <View style={{ flexDirection: "row", justifyContent: "center", gap: spacing.md, marginVertical: spacing.xl }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setStars(n)}>
            <Text style={{ fontSize: 36, color: n <= stars ? colors.warning : colors.fill }}>★</Text>
          </Pressable>
        ))}
      </View>
      <Input label="Góp ý" value={comment} onChangeText={setComment} multiline />
      <Button title="Gửi đánh giá" onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />
    </Screen>
  );
}
