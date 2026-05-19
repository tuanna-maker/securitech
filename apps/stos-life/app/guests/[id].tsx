import { useQuery } from "@tanstack/react-query";
import { View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useLocalSearchParams } from "expo-router";
import { Screen } from "../../components/ui/Screen";
import { GroupedSection } from "../../components/ui/GroupedSection";
import { db } from "../../lib/db";
import { spacing } from "../../lib/design";

export default function GuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useQuery({
    queryKey: ["invite", id],
    queryFn: async () => {
      const { data: row } = await db.from("visitor_invites").select("*").eq("id", id).single();
      return row;
    },
  });

  return (
    <Screen title="Mã QR khách">
      <GroupedSection>
        <View style={styles.qr}>
          {data?.qr_token ? <QRCode value={data.qr_token} size={200} /> : null}
        </View>
      </GroupedSection>
    </Screen>
  );
}

const styles = StyleSheet.create({ qr: { alignItems: "center", padding: spacing.xl } });
