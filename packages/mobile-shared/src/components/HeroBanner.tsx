import { ReactNode } from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { brand } from "../design/theme";

const defaultGradient = [brand.navy, "#2563EB"] as const;

export function HeroBanner({
  title,
  subtitle,
  badge,
  illustration,
  gradient = defaultGradient,
  coverImageUrl,
  isDark = false,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  illustration?: ReactNode;
  gradient?: readonly [string, string];
  coverImageUrl?: string | null;
  isDark?: boolean;
}) {
  const content = (
    <LinearGradient
      colors={
        coverImageUrl
          ? [`${brand.navy}E6`, `${brand.navy}CC`]
          : isDark
            ? [brand.navy, "#1E293B"]
            : [...gradient]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.row}>
        <View style={styles.textCol}>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>
        {illustration ? <View style={styles.illust}>{illustration}</View> : null}
      </View>
    </LinearGradient>
  );

  if (coverImageUrl) {
    return (
      <ImageBackground source={{ uri: coverImageUrl }} style={styles.bg} imageStyle={styles.bgImage}>
        {content}
      </ImageBackground>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  bg: { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  bgImage: { borderRadius: 16 },
  banner: { borderRadius: 16, padding: 16, marginBottom: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  textCol: { flex: 1, paddingRight: 8 },
  illust: { opacity: 1 },
  title: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", marginTop: 4 },
  sub: { fontSize: 15, color: "rgba(255,255,255,0.88)", marginTop: 4 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#fff" },
});
