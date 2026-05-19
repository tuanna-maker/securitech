import { useState } from "react";
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Input } from "../../components/ui/Input";
import { GradientButton } from "../../components/ui/GradientButton";
import { SystemLogo } from "../../components/brand/SystemLogo";
import { gradients, brand } from "../../lib/brand";
import { spacing, textStyle, radii } from "../../lib/design";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err.message);
    else router.replace("/");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <LinearGradient colors={isDark ? [brand.navy, "#0F172A"] : [...gradients.lifeHero]} style={styles.hero}>
            <View style={styles.heroLogo}>
              <SystemLogo width={260} variant="full" />
            </View>
            <Text style={[textStyle("largeTitle", "bold"), styles.heroTitle]}>STOS Life</Text>
            <Text style={styles.heroSub}>Có việc gì, cứ gọi anh!</Text>
          </LinearGradient>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <Input label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />
            {error ? <Text style={[textStyle("footnote"), { color: colors.danger }]}>{error}</Text> : null}
            <GradientButton title="Đăng nhập" onPress={onSubmit} loading={loading} style={{ marginTop: spacing.sm }} />
            <Link href="/(auth)/activate" asChild>
              <Text style={[textStyle("subhead", "semibold"), { color: colors.primary, textAlign: "center", marginTop: spacing.lg }]}>
                Kích hoạt tài khoản cư dân
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.section },
  hero: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radii.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    alignItems: "center",
    overflow: "hidden",
  },
  heroLogo: { marginBottom: spacing.sm },
  heroTitle: { color: "#fff", textAlign: "center" },
  heroSub: { ...textStyle("subhead"), color: "rgba(255,255,255,0.9)", marginTop: 4, marginBottom: spacing.sm },
  card: {
    marginHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#1E3066",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    gap: spacing.md,
  },
});
