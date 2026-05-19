import { useEffect, useState } from "react";
import { View, StyleSheet, Linking, Pressable, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "../../../components/ui/Screen";
import { db } from "../../../lib/db";
import { spacing } from "../../../lib/design";

export default function GrabMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [guardPos, setGuardPos] = useState<{ lat: number; lng: number } | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    db.from("quick_service_requests").select("staff_members(phone)").eq("id", id).single().then(({ data }) => {
      const sm = data?.staff_members as { phone?: string } | null;
      if (sm?.phone) setPhone(sm.phone);
    });
    const ch = db
      .channel(`pings-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guard_location_pings", filter: `request_id=eq.${id}` }, (p) => {
        const row = p.new as { lat: number; lng: number };
        setGuardPos({ lat: row.lat, lng: row.lng });
      })
      .subscribe();
    return () => { db.removeChannel(ch); };
  }, [id]);

  const region = guardPos
    ? { latitude: guardPos.lat, longitude: guardPos.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : { latitude: 10.7769, longitude: 106.7009, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <Screen title="Vị trí anh hỗ trợ" scroll={false}>
      <View style={styles.mapWrap}>
        <MapView style={StyleSheet.absoluteFill} region={region}>
          {guardPos ? <Marker coordinate={{ latitude: guardPos.lat, longitude: guardPos.lng }} title="Anh hỗ trợ" /> : null}
        </MapView>
        {phone ? (
          <Pressable style={styles.call} onPress={() => Linking.openURL(`tel:${phone}`)}>
            <Ionicons name="call" size={22} color="#fff" />
            <Text style={{ color: "#fff", marginLeft: 8 }}>Gọi anh</Text>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mapWrap: { flex: 1, borderRadius: 12, overflow: "hidden", marginTop: spacing.md },
  call: { position: "absolute", bottom: 24, alignSelf: "center", flexDirection: "row", backgroundColor: "#007AFF", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
});
