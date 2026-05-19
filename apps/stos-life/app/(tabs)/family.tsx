import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  type ImageSourcePropType,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { mockCardStyle } from "@stos/mobile-shared";
import { router } from "expo-router";
import { QueryErrorState } from "@stos/mobile-shared";
import { Screen } from "../../components/ui/Screen";
import { FamilyTabHeader } from "../../components/life/family/FamilyTabHeader";
import { FamilyGlyph, type FamilyGlyphName } from "../../components/life/family/FamilyGlyphs";
import { FamilyQuickTile, FamilyQuickTileRow } from "../../components/life/family/FamilyQuickTile";
import { FamilyServiceTile } from "../../components/life/family/FamilyServiceTile";
import { MgmtGradientIcon } from "../../components/life/family/MgmtGradientIcon";
import { LifeGradientIcon } from "../../components/life/family/LifeGradientIcon";
import { SectionTitle } from "../../components/life/SectionTitle";
import { useTheme } from "../../hooks/useTheme";
import { useFamilyDashboard } from "../../hooks/useFamilyDashboard";
import { useAuth } from "../../hooks/useAuth";
import { brand } from "../../lib/brand";
import { FAMILY_QUICK_UI } from "../../lib/familyUiConfig";
import { openLifeFeature } from "../../lib/lifeNav";
import { radii, textStyle } from "../../lib/design";
import { getFamilyDashboardFallback } from "../../lib/familyApi";
import { familyAssets } from "../../lib/familyAssets";
import type { LifeGradientIconName } from "../../components/life/family/LifeGradientIcon";

const KID_AVATAR: Record<string, ImageSourcePropType> = {
  minh: familyAssets.kidMinh,
  an: familyAssets.kidAn,
};

const FOOD_THUMB: Record<string, ImageSourcePropType> = {
  strawberry: familyAssets.foodStrawberry,
  milk: familyAssets.foodMilk,
  salmon: familyAssets.foodSalmon,
};

const MGMT_META: { key: string; title: string; icon: LifeGradientIconName }[] = [
  { key: "spending", title: "Chi tiêu gia đình", icon: "wallet" },
  { key: "kids", title: "Đồng hành cùng con", icon: "child" },
  { key: "fridge", title: "Thực phẩm & Tủ lạnh", icon: "food" },
  { key: "health", title: "Sức khỏe gia đình", icon: "health" },
];

export default function FamilyScreen() {
  const { colors, isDark } = useTheme();
  const { resident } = useAuth();
  const { data, isLoading, isError, refetch, isFetching } = useFamilyDashboard();

  const dash = data ?? getFamilyDashboardFallback();
  const photoUri = dash.profile.photoUrl;
  const familyPhotoSrc: ImageSourcePropType = photoUri ? { uri: photoUri } : familyAssets.hero;
  const kidsBg = "#EDE9FE";
  const kidsColor = "#7C3AED";
  const fridgeColor = "#EA580C";

  return (
    <Screen title="" largeTitle={false} scroll>
      <FamilyTabHeader
        title="Gia đình tôi"
        notifyCount={dash.notifyCount}
        avatarUrl={resident?.avatar_url ?? photoUri ?? undefined}
        avatarFallback={familyAssets.heroSm}
      />

      {isError ? <QueryErrorState onRetry={() => refetch()} /> : null}
      {isLoading && !data ? (
        <View style={styles.loading}>
          <ActivityIndicator color={brand.blue} />
        </View>
      ) : null}

      <Pressable
        onPress={() => openLifeFeature("Hồ sơ gia đình", dash.profile.name)}
        style={[
          styles.profileCard,
          mockCardStyle({
            isDark,
            backgroundColor: colors.card,
            borderColor: isDark ? colors.border : "transparent",
            radius: 24,
          }),
        ]}
      >
        <View style={styles.profileRow}>
          <View style={styles.avatarOuter}>
            <Image source={familyPhotoSrc} style={styles.familyPhoto} />
            <View style={styles.camBtn}>
              <Ionicons name="camera" size={13} color="#fff" />
            </View>
          </View>
          <View style={styles.profileMain}>
            <View style={styles.profileHead}>
              <View style={styles.profileText}>
                <Text style={[textStyle("title3", "bold"), { color: colors.text }]} numberOfLines={1}>
                  {dash.profile.name}
                </Text>
                <View style={styles.nameMeta}>
                  <View style={styles.memberPill}>
                    <Text style={styles.memberPillText}>{dash.profile.memberCount} thành viên</Text>
                  </View>
                </View>
              </View>
              <FamilyGlyph name="chevron" size={18} color={colors.textTertiary} />
            </View>
            {dash.profile.motto ? (
              <Text style={[textStyle("footnote"), styles.motto, { color: colors.textSecondary }]}>
                "{dash.profile.motto}" 💙
              </Text>
            ) : null}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <FamilyQuickTileRow>
          {FAMILY_QUICK_UI.map((a) => (
            <FamilyQuickTile key={a.key} label={a.label} icon={a.icon} onPress={() => openLifeFeature(a.label)} />
          ))}
        </FamilyQuickTileRow>
      </Pressable>

      <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>QUẢN LÝ GIA ĐÌNH</Text>
      <View style={styles.mgmtGrid}>
        {MGMT_META.map((card) => (
          <Pressable
            key={card.key}
            onPress={() => {
              if (card.key === "spending") router.push("/family/spending");
              else if (card.key === "health") router.push("/(tabs)/health");
              else openLifeFeature(card.title);
            }}
            style={[
              styles.mgmtCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              mockCardStyle({ isDark, backgroundColor: colors.card, borderColor: colors.border, radius: 16 }),
            ]}
          >
            <View style={styles.mgmtTop}>
              <MgmtGradientIcon name={card.icon} size={36} />
              <FamilyGlyph name="chevron" size={14} color={colors.textTertiary} />
            </View>
            <Text style={[textStyle("subhead", "semibold"), { color: colors.text, marginTop: 10 }]}>{card.title}</Text>

            {card.key === "spending" && dash.spending ? (
              <>
                <Text style={[textStyle("caption2"), { color: colors.textSecondary, marginTop: 4 }]}>
                  {dash.spending.monthLabel}
                </Text>
                <Text style={[textStyle("title3", "bold"), { color: colors.text }]}>{dash.spending.totalFormatted}</Text>
                {dash.spending.trendLabel ? (
                  <Text style={[textStyle("caption2"), { color: "#16A34A", marginTop: 2 }]}>{dash.spending.trendLabel}</Text>
                ) : null}
              </>
            ) : null}

            {card.key === "kids"
              ? dash.kids.map((c) => (
                  <View key={c.id} style={styles.kidRow}>
                    {c.avatarKey && KID_AVATAR[c.avatarKey] ? (
                      <Image source={KID_AVATAR[c.avatarKey]} style={styles.kidAvatarImg} />
                    ) : (
                      <View style={[styles.kidAvatar, { backgroundColor: kidsBg }]}>
                        <Text style={[textStyle("caption2", "bold"), { color: kidsColor }]}>{c.initial}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[textStyle("caption1", "semibold"), { color: colors.text }]}>{c.name}</Text>
                      <View style={styles.kidMeta}>
                        <View style={[styles.dot, { backgroundColor: c.dot }]} />
                        <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>{c.detail}</Text>
                      </View>
                    </View>
                  </View>
                ))
              : null}

            {card.key === "fridge" && dash.fridge.alert ? (
              <View style={styles.foodRow}>
                <Text style={[textStyle("caption2", "semibold"), { color: fridgeColor, flex: 1 }]} numberOfLines={2}>
                  {dash.fridge.alert}
                </Text>
                <View style={styles.thumbRow}>
                  {dash.fridge.thumbs.map((t) =>
                    t.assetKey && FOOD_THUMB[t.assetKey] ? (
                      <Image key={t.id} source={FOOD_THUMB[t.assetKey]} style={styles.thumb} />
                    ) : (
                      <View key={t.id} style={[styles.thumb, { backgroundColor: colors.fill }]} />
                    )
                  )}
                </View>
              </View>
            ) : null}

            {card.key === "health"
              ? dash.healthReminders.map((r) => (
                  <View key={r.id} style={styles.reminder}>
                    <FamilyGlyph
                      name={(r.icon ?? "pills") as FamilyGlyphName}
                      size={16}
                      color={r.accentColor}
                    />
                    <Text style={[textStyle("caption2"), { color: colors.textSecondary, flex: 1 }]} numberOfLines={2}>
                      {r.text}
                    </Text>
                  </View>
                ))
              : null}
          </Pressable>
        ))}
      </View>

      <SectionTitle title="DỊCH VỤ GIA ĐÌNH" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {dash.services.map((s) => (
          <FamilyServiceTile key={s.key} label={s.label} icon={s.icon} onPress={() => openLifeFeature(s.label)} />
        ))}
      </ScrollView>

      <SectionTitle title="KHOẢNH KHẮC GIA ĐÌNH" link="Xem tất cả" onLink={() => openLifeFeature("Khoảnh khắc")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.momentsScroll}>
        {dash.moments.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => openLifeFeature(m.title)}
            style={[
              styles.momentCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              mockCardStyle({ isDark, backgroundColor: colors.card, borderColor: colors.border, radius: 16 }),
            ]}
          >
            <Image
              source={familyAssets.moments[m.momentIndex] ?? familyAssets.moments[0]}
              style={styles.momentImg}
            />
            <View style={styles.momentBody}>
              <Text style={[textStyle("caption1", "semibold"), { color: colors.text }]} numberOfLines={1}>
                {m.title}
              </Text>
              <Text style={[textStyle("caption2"), { color: colors.textTertiary }]}>{m.date}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View
        style={[
          styles.aiBar,
          {
            backgroundColor: isDark ? "rgba(37, 99, 235, 0.14)" : "#EFF6FF",
            borderColor: isDark ? "rgba(91, 141, 239, 0.35)" : "#BFDBFE",
          },
        ]}
      >
        <View style={styles.aiLeft}>
          <View style={styles.aiRobot}>
            <FamilyGlyph name="robot" size={26} color="#fff" />
          </View>
          <Text style={[textStyle("caption1", "semibold"), { color: colors.text }]} numberOfLines={2}>
            AI gợi ý{"\n"}cho gia đình bạn
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.aiScroll}>
          {dash.aiHints.map((h) => (
            <View
              key={h.text}
              style={[styles.aiChip, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <LifeGradientIcon name={h.icon} size={18} />
              <Text style={[textStyle("caption2"), { color: colors.text }]} numberOfLines={1}>
                {h.text}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={{ height: 100 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: 24, alignItems: "center" },
  profileCard: { padding: 18, marginBottom: 20 },
  profileRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  profileMain: { flex: 1, minWidth: 0 },
  profileHead: { flexDirection: "row", alignItems: "flex-start", gap: 4 },
  profileText: { flex: 1, minWidth: 0 },
  nameMeta: { flexDirection: "row", marginTop: 6 },
  avatarOuter: { position: "relative" },
  familyPhoto: { width: 80, height: 80, borderRadius: 40 },
  camBtn: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  memberPill: { backgroundColor: "#DBEAFE", paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill, alignSelf: "flex-start" },
  memberPillText: { fontSize: 11, fontWeight: "600", color: "#1D4ED8" },
  motto: { marginTop: 6, fontStyle: "italic", lineHeight: 18 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 10 },
  mgmtGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12, marginBottom: 8 },
  mgmtCard: { width: "48%", borderRadius: 16, borderWidth: 1, padding: 14, minHeight: 160 },
  mgmtTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  kidRow: { flexDirection: "row", gap: 8, marginTop: 10, alignItems: "center" },
  kidAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  kidAvatarImg: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: "#fff" },
  foodRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  kidMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  thumbRow: { flexDirection: "row", gap: 6, flexShrink: 0 },
  thumb: { width: 40, height: 40, borderRadius: 8 },
  reminder: { flexDirection: "row", gap: 6, marginTop: 8, alignItems: "flex-start" },
  servicesScroll: { gap: 12, paddingBottom: 4, paddingRight: 8 },
  momentsScroll: { gap: 12, paddingBottom: 4 },
  momentCard: { width: 156, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  momentImg: { width: "100%", height: 100 },
  momentBody: { padding: 10 },
  aiBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginTop: 20,
    gap: 10,
  },
  aiLeft: { width: 100, alignItems: "center", gap: 6 },
  aiRobot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
  },
  aiScroll: { flex: 1 },
  aiChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
    marginRight: 8,
    borderWidth: 1,
    maxWidth: 220,
  },
});
