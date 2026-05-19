import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Illustration, copy, trackEvent } from "@stos/mobile-shared";
import { setOnboardingComplete } from "../../lib/onboarding";
import { spacing, textStyle } from "../../lib/design";
import { brand } from "../../lib/brand";

const SLIDES = [
  { illustration: "onboarding-security" as const, ...copy.onboarding.security },
  { illustration: "onboarding-amenities" as const, ...copy.onboarding.amenities },
  { illustration: "onboarding-community" as const, ...copy.onboarding.community },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];

  const finish = async () => {
    await setOnboardingComplete();
    trackEvent("onboarding_complete");
    router.replace("/(tabs)");
  };

  const next = () => {
    if (step >= SLIDES.length - 1) finish();
    else setStep((s) => s + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Illustration name={slide.illustration} width={200} height={168} />
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.sub}>{slide.subtitle}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <Pressable onPress={next} style={styles.btn}>
          <Text style={styles.btnText}>{step === SLIDES.length - 1 ? "Bắt đầu" : "Tiếp"}</Text>
        </Pressable>
        {step < SLIDES.length - 1 ? (
          <Pressable onPress={finish} style={styles.skip}>
            <Text style={styles.skipText}>Bỏ qua</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  title: { ...textStyle("title2", "bold"), color: brand.navy, marginTop: spacing.xl, textAlign: "center" },
  sub: { ...textStyle("body"), color: "#3C3C43", marginTop: spacing.md, textAlign: "center", lineHeight: 22 },
  footer: { padding: spacing.xl, paddingBottom: spacing.section },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E5E7EB" },
  dotActive: { backgroundColor: brand.navy, width: 24 },
  btn: { backgroundColor: brand.navy, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  skip: { marginTop: spacing.md, alignItems: "center" },
  skipText: { color: brand.navyMuted, fontSize: 15 },
});
