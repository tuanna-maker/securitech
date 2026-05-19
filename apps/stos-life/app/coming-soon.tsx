import { View, Text, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { StosIcon } from "@stos/mobile-shared";
import { Screen } from "../components/ui/Screen";
import { Button } from "../components/ui/Button";
import { useTheme } from "../hooks/useTheme";
import { brand } from "../lib/brand";
import { spacing, textStyle } from "../lib/design";

export default function ComingSoonScreen() {
  const { title, subtitle } = useLocalSearchParams<{ title?: string; subtitle?: string }>();
  const { colors } = useTheme();

  return (
    <Screen title={title || "Sắp ra mắt"} subtitle={subtitle || undefined}>
      <View style={styles.center}>
        <View style={[styles.icon, { backgroundColor: brand.navy + "15" }]}>
          <StosIcon name="construct" size={40} color={brand.navy} />
        </View>
        <Text style={[textStyle("body"), { color: colors.textSecondary, textAlign: "center", marginTop: spacing.lg }]}>
          Tính năng đang được hoàn thiện. Giao diện đã sẵn sàng — nghiệp vụ sẽ được bổ sung trong bản cập nhật tiếp theo.
        </Text>
        <Button title="Quay lại" variant="outline" onPress={() => router.back()} style={{ marginTop: spacing.xl }} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48 },
  icon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
});
