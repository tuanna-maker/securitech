import { router } from "expo-router";
import * as Location from "expo-location";
import { Screen } from "../components/ui/Screen";
import { SOSHoldButton } from "../components/shared/SOSHoldButton";
import { useAuth } from "../hooks/useAuth";
import { db, functionsUrl } from "../lib/db";

export default function GuardSOSScreen() {
  const { staff } = useAuth();

  const triggerSOS = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    const { data: { session } } = await db.auth.getSession();
    await fetch(`${functionsUrl}/sos-handler`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session!.access_token}` },
      body: JSON.stringify({
        building_id: staff?.building_id,
        caller_name: staff?.name,
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      }),
    });
    router.back();
  };

  return (
    <Screen title="SOS hiện trường" subtitle="Giữ 3 giây" scroll={false}>
      <SOSHoldButton onTriggered={triggerSOS} />
    </Screen>
  );
}
