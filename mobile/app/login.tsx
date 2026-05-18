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
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export default function LoginScreen() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
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
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.primary }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.logo}>STOS</Text>
          <Text style={styles.tagline}>Hệ điều hành chung cư</Text>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Đăng nhập</Text>
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="admin@company.vn"
          />
          <Input
            label="Mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />
          <Button title="Đăng nhập" onPress={handleLogin} loading={submitting} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  hero: { alignItems: "center", marginBottom: 24 },
  logo: { fontSize: 36, fontWeight: "700", color: "#fff" },
  tagline: { color: "#94A3B8", marginTop: 8, fontSize: 14 },
  card: { borderRadius: 16, padding: 20 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
});
