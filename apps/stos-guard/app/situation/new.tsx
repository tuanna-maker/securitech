import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { GuardGlyph } from "../../components/guard/GuardGlyphs";
import { Screen } from "../../components/ui/Screen";
import { GuardScreenHeader } from "../../components/guard/GuardScreenHeader";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { INCIDENT_UI } from "../../lib/guardUiConfig";
import { guardCard } from "../../lib/guardSurfaces";
import { callFunction } from "../../lib/db";
import { spacing, textStyle } from "../../lib/design";

const STEP_LABELS = ["Loại sự cố", "Chi tiết", "Gửi báo cáo"];

export default function SituationReportScreen() {
  const { staff } = useAuth();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await callFunction("service-handler", {
        method: "POST",
        query: { type: "support" },
        body: {
          building_id: staff?.building_id,
          title: title || INCIDENT_UI.find((c) => c.key === category)?.label || "Sự cố",
          description,
          category: category || "other",
          priority: "high",
        },
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="" largeTitle={false} scroll>
      <GuardScreenHeader title="BÁO SỰ CỐ" showBack />

      <View style={styles.steps}>
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          return (
            <View key={label} style={styles.stepCol}>
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, { backgroundColor: step >= n ? "#007AFF" : "#252D3A" }]}>
                  <Text style={[textStyle("caption2", "bold"), { color: step >= n ? "#fff" : "#64748B" }]}>{n}</Text>
                </View>
                {n < 3 ? <View style={[styles.stepLine, { backgroundColor: step > n ? "#007AFF" : "#252D3A" }]} /> : null}
              </View>
              <Text style={[textStyle("caption2"), { color: step >= n ? "#fff" : "#64748B", marginTop: 4, textAlign: "center" }]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      {step === 1 ? (
        <>
          <Text style={[textStyle("footnote", "semibold"), { color: "#94A3B8", marginBottom: spacing.md }]}>
            Bước 1 — Chọn loại sự cố
          </Text>
          <View style={styles.grid}>
            {INCIDENT_UI.map((c) => (
              <Pressable
                key={c.key}
                onPress={() => {
                  setCategory(c.key);
                  setTitle(c.label);
                  setStep(2);
                }}
                style={[styles.catCard, guardCard(), category === c.key && { borderColor: c.color }]}
              >
                <View style={[styles.catIcon, { backgroundColor: c.bg }]}>
                  <GuardGlyph name={c.glyph} size={32} color={c.color} />
                </View>
                <Text style={[textStyle("subhead", "semibold"), { color: "#fff" }]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : step === 2 ? (
        <>
          <Text style={[textStyle("footnote", "semibold"), { color: "#94A3B8", marginBottom: spacing.md }]}>Bước 2 — Chi tiết</Text>
          <Input label="Tiêu đề" value={title} onChangeText={setTitle} />
          <Input label="Mô tả" value={description} onChangeText={setDescription} multiline />
          <Button title="Tiếp tục" onPress={() => setStep(3)} style={{ marginTop: spacing.lg }} />
          <Button title="← Chọn lại" variant="plain" onPress={() => setStep(1)} />
        </>
      ) : (
        <>
          <Text style={[textStyle("footnote", "semibold"), { color: "#94A3B8", marginBottom: spacing.md }]}>Bước 3 — Gửi</Text>
          <View style={[styles.summary, guardCard()]}>
            <Text style={[textStyle("subhead", "semibold"), { color: "#fff" }]}>{title}</Text>
            <Text style={[textStyle("footnote"), { color: "#94A3B8", marginTop: 8 }]}>{description || "—"}</Text>
          </View>
          <Button title="GỬI BÁO CÁO" onPress={submit} loading={loading} style={{ marginTop: spacing.lg }} />
          <Button title="← Sửa" variant="plain" onPress={() => setStep(2)} />
        </>
      )}
      <View style={{ height: 40 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  steps: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.xl, paddingHorizontal: spacing.sm },
  stepCol: { alignItems: "center", flex: 1 },
  stepRow: { flexDirection: "row", alignItems: "center" },
  stepDot: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  stepLine: { width: 36, height: 3, marginHorizontal: 2, borderRadius: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  catCard: { width: "48%", minHeight: 118, alignItems: "center", justifyContent: "center", padding: spacing.md, gap: spacing.sm },
  catIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  summary: { padding: spacing.lg },
});
