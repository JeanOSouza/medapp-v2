import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

// Importações do projeto
import api from "../../service/api";
import { colors, spacing } from "../theme";
import Logo from "../components/Logo";
import Input from "../components/Input";
import Button from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !senha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      // 1. Enviando os dados para o backend
      // Verifique se o backend espera 'password' ou 'senha'
      const response = await api.post("/login", {
        email: email.trim().toLowerCase(), // Remove espaços extras
        senha: senha.trim(),
      });

      const { token } = response.data;

      // 2. Salvando o token (com try/catch para evitar o erro de Native Module)
      try {
        if (token) {
          await AsyncStorage.setItem("token", response.data.token);
          await AsyncStorage.setItem(
            "user",
            JSON.stringify(response.data.user),
          );
        }
      } catch (storageError) {
        console.log("Erro ao salvar no AsyncStorage:", storageError);
        // Mesmo se o storage falhar, podemos tentar navegar
      }

      // 3. Sucesso!
      navigation.navigate("MainTabs");
    } catch (error) {
      // 4. Tratamento de Erro detalhado
      console.log("Erro no Login:", error.response?.data || error.message);

      let mensagemErro = "Login inválido. Verifique suas credenciais.";

      if (error.response?.status === 404) {
        mensagemErro = "Servidor não encontrado (Erro 404). Verifique a rota.";
      } else if (error.response?.data?.message) {
        mensagemErro = error.response.data.message;
      }

      Alert.alert("Erro", mensagemErro);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoArea}>
          <Logo size="lg" />
          <Text style={styles.subtitle}>
            Gerencie seus medicamentos{"\n"}com facilidade.
          </Text>
        </View>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.forgotRow}>
          <Text style={styles.forgot}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <Button
          title={loading ? "Carregando..." : "Entrar"}
          onPress={handleLogin}
          disabled={loading}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("Cadastro")}
          style={styles.registerRow}
        >
          <Text style={styles.registerText}>
            Não tem uma conta? <Text style={styles.link}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
    gap: spacing.md,
  },
  logoArea: { alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.secondary,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 22,
  },
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  forgot: { color: colors.secondary, fontSize: 15, fontWeight: "bold" },
  registerRow: { alignItems: "center", marginTop: spacing.sm },
  registerText: { fontSize: 15, color: colors.textLight },
  link: { color: colors.secondary, fontWeight: "600" },
});
