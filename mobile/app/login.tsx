import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { GroupedSection } from "../components/ui/GroupedSection";
import { spacing, textStyle } from "../lib/design";

export default function LoginScreen() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    router.replace("/(tabs)");
    return null;
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) Alert.alert("Đăng nhập thất bại", error.message);
    else router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
              <Text style={[textStyle("title2", "bold"), { color: "#FFFFFF" }]}>STOS</Text>
            </View>
            <Text style={[textStyle("title3", "bold"), { color: colors.text, marginTop: spacing.lg }]}>
              Hệ điều hành chung cư
            </Text>
            <Text style={[textStyle("subhead"), { color: colors.textSecondary, marginTop: spacing.xs }]}>
              SecuriTech Operations
            </Text>
          </View>

          <GroupedSection>
            <View style={styles.form}>
              <Text style={[textStyle("title3", "bold"), { color: colors.text, marginBottom: spacing.lg }]}>
                Đăng nhập
              </Text>
              <Input
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                placeholder="admin@company.vn"
              />
              <Input
                label="Mật khẩu"
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
                placeholder="Mật khẩu"
              />
              <Button title="Đăng nhập" onPress={handleLogin} loading={submitting} />
            </View>
          </GroupedSection>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  hero: { alignItems: "center", marginBottom: spacing.xxl },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  form: { padding: spacing.lg },
});
