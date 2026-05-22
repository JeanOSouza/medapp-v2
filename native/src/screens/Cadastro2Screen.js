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
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native"; // Importante para pegar os dados da Tela 1
import api from "../../service/api";
import { colors, spacing } from "../theme";
import Logo from "../components/Logo";
import Input from "../components/Input";
import Button from "../components/Button";

export default function Cadastro2Screen({ navigation }) {
  const route = useRoute();
  const { formData } = route.params || {}; // Aqui estão nome, data, raca, genero

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [comorbidades, setComorbidades] = useState("");
  const [telefone, setTelefone] = useState("");
  const [termos, setTermos] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFinalizar() {
    // 1. Validações
    if (!email || !senha || !telefone || !comorbidades) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    if (!termos) {
      Alert.alert("Erro", "Aceite os termos para continuar.");
      return;
    }

    setLoading(true);

    try {
      // 2. Monta o pacote completo (Tela 1 + Tela 2)
      const payload = {
        ...formData,
        email: email.toLowerCase().trim(),
        senha: senha,
        telefone: telefone,
        comorbidades: comorbidades,
      };

      // 3. Chamada ao Backend
      await api.post("/registrar", payload);

      // 4. Sucesso: Manda para o Login (para ele gerar o token corretamente)
      Alert.alert("Sucesso", "Conta criada com sucesso!", [
        { text: "Ir para Login", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      console.log("Erro no cadastro:", error.response?.data);
      const errorMsg =
        error.response?.data?.message || "Erro ao conectar com o servidor.";
      Alert.alert("Erro no Cadastro", errorMsg);
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
          <Logo />
          <Text style={styles.title}>Continuar seu cadastro</Text>
        </View>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Comorbidades"
          value={comorbidades}
          onChangeText={setComorbidades}
          autoCapitalize="none"
        />
        <Input
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        <Input
          label="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          placeholder="(00) 00000-0000"
        />

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setTermos(!termos)}
        >
          <View style={[styles.checkbox, termos && styles.checked]} />
          <Text style={styles.termsText}>
            Concordo com os Termos e a Política de Privacidade.
          </Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} />
        ) : (
          <Button
            title="Finalizar cadastro"
            onPress={handleFinalizar}
            style={{ marginBottom: spacing.md }}
          />
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.loginRow}
        >
          <Text style={styles.loginText}>
            Já tem uma conta? <Text style={styles.link}>Iniciar sessão</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg },
  logoArea: { alignItems: "center", marginBottom: spacing.lg, gap: spacing.sm },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.secondary,
    fontStyle: "italic",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    borderRadius: 3,
    marginTop: 2,
  },
  checked: { backgroundColor: colors.secondary },
  termsText: { flex: 1, fontSize: 12, color: colors.secondary },
  loginRow: { alignItems: "center" },
  loginText: { fontSize: 13, color: colors.textLight },
  link: { color: colors.secondary, fontWeight: "600" },
});
