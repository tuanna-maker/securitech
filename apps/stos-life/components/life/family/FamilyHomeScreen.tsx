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
import { router } from "expo-router";
import { QueryErrorState } from "@stos/mobile-shared";
import { Screen } from "../../ui/Screen";
import { FamilyTabHeader } from "./FamilyTabHeader";
import { FamilyGlyph, type FamilyGlyphName } from "./FamilyGlyphs";
import { FamilyQuickTile, FamilyQuickTileRow } from "./FamilyQuickTile";
import { FamilyServiceTile } from "./FamilyServiceTile";
import { MgmtGradientIcon } from "./MgmtGradientIcon";
import { FamilyAiCard } from "./FamilyAiCard";
import { useTheme } from "../../../hooks/useTheme";
import { useFamilyDashboard } from "../../../hooks/useFamilyDashboard";
import { useAuth } from "../../../hooks/useAuth";
import { FAMILY_QUICK_UI } from "../../../lib/familyUiConfig";
import { openLifeFeature } from "../../../lib/lifeNav";
import { radii, cardShadow } from "../../../lib/design";
import { getFamilyDashboardFallback } from "../../../lib/familyApi";
import { familyAssets } from "../../../lib/familyAssets";
import type { LifeGradientIconName } from "./LifeGradientIcon";

const KID_AVATAR: Record<string, ImageSourcePropType> = {
  minh: familyAssets.kidMinh,
  an: familyAssets.kidAn,
};

const FOOD_THUMB: Record<string, ImageSourcePropType> = {
  strawberry: familyAssets.foodStrawberry,
  milk: familyAssets.foodMilk,
  salmon: familyAssets.foodSalmon,
};

const MGMT_META: {
  key: string;
  title: string;
  icon: LifeGradientIconName;
  bgKey: "mcBlue" | "mcPink" | "mcOrange" | "mcGreen";
  iconBgKey: "iconBgB" | "iconBgP" | "iconBgO" | "iconBgG";
}[] = [
  { key: "spending", title: "Chi tiêu gia đình", icon: "wallet", bgKey: "mcBlue", iconBgKey: "iconBgB" },
  { key: "kids", title: "Đồng hành cùng con", icon: "child", bgKey: "mcPink", iconBgKey: "iconBgP" },
  { key: "fridge", title: "Thực phẩm & Tủ lạnh", icon: "food", bgKey: "mcOrange", iconBgKey: "iconBgO" },
  { key: "health", title: "Sức khỏe gia đình", icon: "health", bgKey: "mcGreen", iconBgKey: "iconBgG" },
];

export function FamilyHomeScreen() {
  const { colors, life, isDark } = useTheme();
  const { resident } = useAuth();
  const { data, isLoading, isError, refetch } = useFamilyDashboard();

  const dash = data ?? getFamilyDashboardFallback();
  const photoUri = dash.profile.photoUrl;
  const familyPhotoSrc: ImageSourcePropType = photoUri ? { uri: photoUri } : familyAssets.hero;

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
          <ActivityIndicator color={life.link} />
        </View>
      ) : null}

      <Pressable
        onPress={() => openLifeFeature("Hồ sơ gia đình", dash.profile.name)}
        style={[styles.heroCard, { backgroundColor: life.bgCard, borderColor: life.border }, cardShadow(isDark)]}
      >
        <View style={styles.heroTop}>
          <View style={styles.familyPhotoWrap}>
            <Image source={familyPhotoSrc} style={styles.familyPhoto} />
            <View style={[styles.camBtn, { backgroundColor: life.bgCard }]}>
              <Ionicons name="camera" size={16} color={life.textSub} />
            </View>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.heroTitleRow}>
              <Text style={[styles.heroName, { color: colors.text }]} numberOfLines={1}>
                {dash.profile.name}
              </Text>
              <View style={[styles.membersPill, { backgroundColor: life.pillBg }]}>
                <Text style={[styles.membersPillText, { color: life.pillText }]}>
                  {dash.profile.memberCount} thành viên
                </Text>
              </View>
              <FamilyGlyph name="chevron" size={14} color="#c0c8dc" />
            </View>
            {dash.profile.motto ? (
              <Text style={[styles.heroSubtitle, { color: life.textSub }]}>
                "{dash.profile.motto}" <Text style={{ color: life.accentBlue, fontStyle: "normal" }}>💙</Text>
              </Text>
            ) : null}
          </View>
        </View>

        <FamilyQuickTileRow>
          {FAMILY_QUICK_UI.map((a) => (
            <FamilyQuickTile key={a.key} label={a.label} icon={a.icon} onPress={() => openLifeFeature(a.label)} />
          ))}
        </FamilyQuickTileRow>
      </Pressable>

      <Text style={[styles.secTitle, { color: colors.text }]}>Quản lý gia đình</Text>
      <View style={styles.mgmtGrid}>
        {MGMT_META.map((card) => (
          <Pressable
            key={card.key}
            onPress={() => {
              if (card.key === "spending") router.push("/(tabs)/spending");
              else if (card.key === "health") router.push("/(tabs)/health");
              else openLifeFeature(card.title);
            }}
            style={[
              styles.mgmtCard,
              { backgroundColor: life[card.bgKey], borderColor: life.border },
              cardShadow(isDark),
            ]}
          >
            <View style={styles.mgmtHead}>
              <View style={[styles.mcIconWrap, { backgroundColor: life[card.iconBgKey] }]}>
                <MgmtGradientIcon name={card.icon} size={26} />
              </View>
              <View style={styles.mgmtHeadText}>
                <Text style={[styles.mcTitle, { color: colors.text }]}>{card.title}</Text>
                {card.key === "spending" && dash.spending ? (
                  <Text style={[styles.mcSub, { color: life.textSub }]}>{dash.spending.monthLabel}</Text>
                ) : null}
              </View>
              <View style={[styles.chevronRight, { borderColor: life.textSub }]} />
            </View>

            {card.key === "spending" && dash.spending ? (
              <>
                <Text style={[styles.mcAmount, { color: colors.text }]}>{dash.spending.totalFormatted}</Text>
                {dash.spending.trendLabel ? (
                  <Text style={[styles.mcTrend, { color: life.success }]}>▼ {dash.spending.trendLabel.replace(/^[▼▲]\s*/, "")}</Text>
                ) : null}
              </>
            ) : null}

            {card.key === "kids"
              ? dash.kids.map((c) => (
                  <View key={c.id} style={styles.childRow}>
                    {c.avatarKey && KID_AVATAR[c.avatarKey] ? (
                      <Image source={KID_AVATAR[c.avatarKey]} style={[styles.childAva, { borderColor: life.bgCard }]} />
                    ) : (
                      <View style={[styles.childAva, styles.caBlue, { borderColor: life.bgCard }]}>
                        <Text style={{ fontSize: 18 }}>{c.initial === "M" ? "👦" : "👧"}</Text>
                      </View>
                    )}
                    <View style={styles.childInfo}>
                      <Text style={[styles.childName, { color: colors.text }]}>{c.name}</Text>
                      <Text style={[styles.childSch, { color: life.textSub }]}>{c.detail}</Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: c.dot }]} />
                  </View>
                ))
              : null}

            {card.key === "fridge" && dash.fridge.alert ? (
              <View style={styles.foodBody}>
                <View style={styles.foodCount}>
                  <Text style={[styles.foodCountNum, { color: colors.text }]}>2</Text>
                  <Text style={[styles.foodCountSmall, { color: life.textSub }]}>
                    thực phẩm{"\n"}sắp hết hạn
                  </Text>
                </View>
                <View style={styles.foodItems}>
                  {dash.fridge.thumbs.slice(0, 4).map((t) =>
                    t.assetKey && FOOD_THUMB[t.assetKey] ? (
                      <Image key={t.id} source={FOOD_THUMB[t.assetKey]} style={[styles.foodItem, { borderColor: "rgba(255,186,90,.25)" }]} />
                    ) : (
                      <View key={t.id} style={[styles.foodItem, { backgroundColor: life.bgCard }]}>
                        <Text>🥕</Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            ) : null}

            {card.key === "health"
              ? dash.healthReminders.map((r) => (
                  <View key={r.id} style={styles.healthRow}>
                    <View style={[styles.healthIcon, r.icon === "pills" ? styles.hiPink : styles.hiPurple]}>
                      <FamilyGlyph name={(r.icon ?? "pills") as FamilyGlyphName} size={16} color={r.accentColor} />
                    </View>
                    <View>
                      <Text style={[styles.healthName, { color: colors.text }]} numberOfLines={1}>
                        {r.text.split("(")[0].trim()}
                      </Text>
                      <Text style={[styles.healthTime, { color: life.textSub }]}>
                        {r.text.includes("(") ? r.text.split("(")[1]?.replace(")", "") : r.text}
                      </Text>
                    </View>
                  </View>
                ))
              : null}
          </Pressable>
        ))}
      </View>

      <Text style={[styles.secTitle, { color: colors.text }]}>Dịch vụ gia đình</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesScroll}>
        {dash.services.map((s) => (
          <FamilyServiceTile key={s.key} label={s.label} icon={s.icon} onPress={() => openLifeFeature(s.label)} />
        ))}
      </ScrollView>

      <View style={styles.rowHead}>
        <Text style={[styles.secTitle, styles.secTitleInline, { color: colors.text }]}>Khoảnh khắc gia đình</Text>
        <Pressable onPress={() => openLifeFeature("Khoảnh khắc")}>
          <Text style={[styles.seeAll, { color: life.link }]}>Xem tất cả</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.momentsScroll}>
        {dash.moments.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => openLifeFeature(m.title)}
            style={[styles.momentCard, { backgroundColor: life.bgCard, borderColor: life.border }, cardShadow(isDark)]}
          >
            <Image source={familyAssets.moments[m.momentIndex] ?? familyAssets.moments[0]} style={styles.momentImg} />
            <View style={styles.momentCaption}>
              <Text style={[styles.momentTitle, { color: colors.text }]} numberOfLines={2}>
                {m.title}
              </Text>
              <Text style={[styles.momentDate, { color: life.textSub }]}>{m.date}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <FamilyAiCard hints={dash.aiHints} onPress={() => openLifeFeature("AI gợi ý")} />

      <View style={{ height: 100 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: 24, alignItems: "center" },
  heroCard: { borderRadius: 22, padding: 16, marginBottom: 6, borderWidth: 1 },
  heroTop: { flexDirection: "row", gap: 14, alignItems: "flex-start", marginBottom: 20 },
  familyPhotoWrap: { position: "relative", width: 140, height: 140 },
  familyPhoto: { width: 140, height: 140, borderRadius: 70 },
  camBtn: {
    position: "absolute",
    bottom: 6,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroRight: { flex: 1, paddingTop: 2 },
  heroTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  heroName: { fontSize: 20, fontWeight: "800", letterSpacing: -0.4, flexShrink: 1 },
  membersPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  membersPillText: { fontSize: 11.5, fontWeight: "700" },
  heroSubtitle: { fontSize: 13, lineHeight: 20, fontStyle: "italic", marginTop: 6 },
  secTitle: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3, marginTop: 20, marginBottom: 12 },
  secTitleInline: { marginTop: 0, marginBottom: 0 },
  rowHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 12,
    paddingRight: 4,
  },
  seeAll: { fontSize: 13.5, fontWeight: "600" },
  mgmtGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  mgmtCard: { width: "48.5%", borderRadius: 20, padding: 16, borderWidth: 1, minHeight: 150 },
  mgmtHead: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  mcIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  mgmtHeadText: { flex: 1, marginLeft: 10, minWidth: 0 },
  mcTitle: { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  mcSub: { fontSize: 12, marginTop: 4 },
  chevronRight: {
    width: 7,
    height: 7,
    borderRightWidth: 2,
    borderTopWidth: 2,
    transform: [{ rotate: "45deg" }],
    marginTop: 6,
  },
  mcAmount: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5, marginTop: 4 },
  mcTrend: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  childRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 10 },
  childAva: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  caBlue: { backgroundColor: "#d5eaff" },
  childInfo: { flex: 1 },
  childName: { fontSize: 13, fontWeight: "700" },
  childSch: { fontSize: 12, marginTop: 1 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  foodBody: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  foodCount: { flexShrink: 0 },
  foodCountNum: { fontSize: 40, fontWeight: "900", lineHeight: 42 },
  foodCountSmall: { fontSize: 12, lineHeight: 15, marginTop: 2 },
  foodItems: { flex: 1, flexDirection: "row", gap: 6 },
  foodItem: { flex: 1, aspectRatio: 1, borderRadius: 13, borderWidth: 1.5, overflow: "hidden" },
  healthRow: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 11 },
  healthIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  hiPink: { backgroundColor: "#ffeef4" },
  hiPurple: { backgroundColor: "#f1eaff" },
  healthName: { fontSize: 13, fontWeight: "700" },
  healthTime: { fontSize: 12, marginTop: 1 },
  servicesScroll: { gap: 10, paddingBottom: 6, paddingRight: 8 },
  momentsScroll: { gap: 10, paddingBottom: 6 },
  momentCard: { width: 140, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  momentImg: { width: "100%", height: 88 },
  momentCaption: { paddingHorizontal: 10, paddingVertical: 8 },
  momentTitle: { fontSize: 12.5, fontWeight: "700", lineHeight: 17 },
  momentDate: { fontSize: 11.5, marginTop: 3 },
});
