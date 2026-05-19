import { View, Text, Image, StyleSheet } from "react-native";

const SIZES = { sm: 40, md: 56, lg: 96 } as const;

type Props = {
  uri?: string | null;
  name?: string;
  size?: keyof typeof SIZES;
};

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Avatar — uses RN Image so Expo Go works without expo-image native module. */
export function Avatar({ uri, name, size = "md" }: Props) {
  const dim = SIZES[size];
  const fontSize = dim * 0.36;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.img, { width: dim, height: dim, borderRadius: dim / 2 }]}
        resizeMode="cover"
        accessibilityLabel={name ? `Avatar ${name}` : "Avatar"}
      />
    );
  }

  return (
    <View style={[styles.fallback, { width: dim, height: dim, borderRadius: dim / 2 }]}>
      <Text style={[styles.initials, { fontSize }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  img: { backgroundColor: "#E5E7EB" },
  fallback: { backgroundColor: "#2E4BB0", alignItems: "center", justifyContent: "center" },
  initials: { color: "#fff", fontWeight: "700" },
});
