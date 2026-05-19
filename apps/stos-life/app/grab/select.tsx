import { useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Screen } from "../../components/ui/Screen";
import { GradientButton } from "../../components/ui/GradientButton";
import { GrabFlowHeader } from "../../components/grab/GrabFlowHeader";
import { ServicePickCard } from "../../components/grab/ServicePickCard";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { db } from "../../lib/db";
import { spacing, textStyle } from "../../lib/design";

const DEFAULT_CATALOG = [
  { code: "open_door", label: "Mở cửa" },
  { code: "receive_parcel", label: "Nhận hộ" },
  { code: "carry_items", label: "Xách đồ" },
  { code: "urgent_assist", label: "Hỗ trợ khẩn" },
];

type CatalogRow = { code?: string; id?: string; label?: string; name?: string };

function normalizeCatalog(raw: unknown) {
  const list = Array.isArray(raw) && raw.length > 0 ? (raw as CatalogRow[]) : DEFAULT_CATALOG;
  const seen = new Set<string>();
  return list.map((item, i) => {
    const base = [item.code, item.id].find((v) => typeof v === "string" && v.trim())?.trim() || `service-${i}`;
    let code = base;
    let n = 0;
    while (seen.has(code)) {
      n += 1;
      code = `${base}-${n}`;
    }
    seen.add(code);
    return { code, label: item.label ?? item.name ?? "Dịch vụ" };
  });
}

export default function GrabSelectScreen() {
  const { resident } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  const { data: catalog } = useQuery({
    queryKey: ["catalog", resident?.building_id],
    enabled: !!resident?.building_id,
    queryFn: async () => {
      const { data } = await db
        .from("building_features")
        .select("service_catalog")
        .eq("building_id", resident!.building_id)
        .maybeSingle();
      return normalizeCatalog(data?.service_catalog as CatalogRow[] | null);
    },
  });

  const rows = useMemo(() => (catalog && catalog.length > 0 ? catalog : DEFAULT_CATALOG), [catalog]);

  const onNext = () => {
    if (!selected) return;
    router.push({ pathname: "/grab/confirm", params: { service_type: selected } });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Screen title="" scroll largeTitle={false}>
        <GrabFlowHeader
          title="Chọn việc cần hỗ trợ"
          subtitle="Anh bảo vệ sẽ nhận việc và đến trong vài phút"
          icon="shield"
          accent="grab"
        />
        <Text style={[textStyle("footnote", "semibold"), styles.sectionLabel, { color: colors.textTertiary }]}>
          DỊCH VỤ PHỔ BIẾN
        </Text>
        {rows.map((item, index) => (
          <ServicePickCard
            key={`${item.code}-${index}`}
            code={item.code}
            label={item.label}
            selected={selected === item.code}
            onPress={() => setSelected(item.code)}
          />
        ))}
        <View style={{ height: 100 }} />
      </Screen>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md, backgroundColor: colors.background }]}>
        <GradientButton
          title="Tiếp tục"
          variant="grab"
          disabled={!selected}
          onPress={onNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sectionLabel: { marginBottom: spacing.sm, marginLeft: spacing.xs },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
});
