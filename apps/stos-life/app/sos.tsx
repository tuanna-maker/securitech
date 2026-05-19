import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { StatusPulse } from "@stos/mobile-shared";
import { Screen } from "../components/ui/Screen";
import { SOSHoldButton } from "../components/shared/SOSHoldButton";
import { useAuth } from "../hooks/useAuth";
import { db, functionsUrl } from "../lib/db";

export default function SOSScreen() {
  const { resident } = useAuth();

  const triggerSOS = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    let lat: number | null = null;
    let lng: number | null = null;
    if (status === "granted") {
      const loc = await Location.getCurrentPositionAsync({});
      lat = loc.coords.latitude;
      lng = loc.coords.longitude;
    }
    const { data: { session } } = await db.auth.getSession();
    await fetch(`${functionsUrl}/sos-handler`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session!.access_token}` },
      body: JSON.stringify({
        building_id: resident!.building_id,
        resident_id: resident!.id,
        caller_name: resident!.full_name,
        caller_phone: resident!.phone,
        lat,
        lng,
      }),
    });
    router.back();
  };

  return (
    <Screen title="SOS Khẩn cấp" subtitle="Giữ nút 3 giây để gửi" scroll={false}>
      <View style={styles.center}>
        <StatusPulse size={140} />
        <SOSHoldButton onTriggered={triggerSOS} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24 },
});
