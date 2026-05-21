import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FamilyGlyph } from "./FamilyGlyphs";
import { LifeGradientIcon, type LifeGradientIconName } from "./LifeGradientIcon";
import { useTheme } from "../../../hooks/useTheme";
import { cardShadow } from "../../../lib/design";

type Hint = { text: string; icon: LifeGradientIconName };

type Props = {
  hints: Hint[];
  onPress?: () => void;
};

/** HTML .ai-card — bot + 3 gợi ý ngang */
export function FamilyAiCard({ hints, onPress }: Props) {
  const { life, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: life.bgCard,
          borderColor: life.border,
        },
        cardShadow(isDark),
      ]}
    >
      <LinearGradient colors={[...life.botBg]} style={[styles.bot, { borderColor: life.border }]}>
        <Text style={{ fontSize: 28 }}>🤖</Text>
      </LinearGradient>
      <View style={styles.body}>
        <Text style={[styles.title, { color: life.link }]}>AI gợi ý cho gia đình bạn</Text>
        <View style={styles.rows}>
          {hints.slice(0, 3).map((h, i) => (
            <View
              key={h.text}
              style={[
                styles.item,
                i < hints.length - 1 && { borderRightWidth: 1, borderRightColor: life.border, marginRight: 10, paddingRight: 10 },
              ]}
            >
              <LifeGradientIcon name={h.icon} size={16} />
              <Text style={[styles.itemText, { color: life.textSub }]} numberOfLines={3}>
                {h.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <FamilyGlyph name="chevron" size={14} color={life.textSub} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  bot: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: "700", marginBottom: 9 },
  rows: { flexDirection: "row" },
  item: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 7, minWidth: 0 },
  itemText: { flex: 1, fontSize: 12, lineHeight: 17 },
});
