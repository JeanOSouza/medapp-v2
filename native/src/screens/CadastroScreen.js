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
import { colors, spacing } from "../theme";
import Logo from "../components/Logo";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";

const racaOpts = [
  { value: "branca", label: "Branca" },
  { value: "parda", label: "Parda" },
  { value: "preta", label: "Preta" },
  { value: "amarela", label: "Amarela" },
];
const generoOpts = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "outro", label: "Outro" },
];

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [data, setData] = useState(""); // Formato DD/MM/AAAA
  const [raca, setRaca] = useState("");
  const [genero, setGenero] = useState("");
  const [termos, setTermos] = useState(false);

  // --- LÓGICA DA MÁSCARA DE DATA ---
  const handleDataChange = (text) => {
    let cleaned = text.replace(/\D/g, ""); // Remove tudo que não é número
    if (cleaned.length > 8) cleaned = cleaned.substring(0, 8);

    if (cleaned.length > 4) {
      cleaned = cleaned.replace(/^(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
    } else if (cleaned.length > 2) {
      cleaned = cleaned.replace(/^(\d{2})(\d{0,2})/, "$1/$2");
    }
    setData(cleaned);
  };

  const handleNextStep = () => {
    if (!nome || !data || !raca || !genero) {
      Alert.alert("Erro", "Preencha todos os campos antes de continuar.");
      return;
    }

    if (data.length < 10) {
      Alert.alert("Erro", "Insira a data completa (DD/MM/AAAA).");
      return;
    }

    if (!termos) {
      Alert.alert("Erro", "Você deve aceitar os termos de uso.");
      return;
    }

    // --- PREPARANDO DATA PARA O BANCO (AAAA-MM-DD) ---
    const [dia, mes, ano] = data.split("/");
    const dataParaBanco = `${ano}-${mes}-${dia}`;

    // Passando os dados formatados para a próxima tela
    navigation.navigate("Cadastro2", {
      formData: {
        nome,
        data: dataParaBanco, // Aqui já vai no padrão do SQLite/MySQL
        raca,
        genero,
      },
    });
  };

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
          <Text style={styles.title}>Faça seu cadastro</Text>
        </View>

        <Input
          label="Nome completo"
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: João Silva"
        />

        <Input
          label="Data de nascimento"
          value={data}
          onChangeText={handleDataChange} // Usa a função da máscara
          placeholder="DD/MM/AAAA"
          keyboardType="numeric"
          maxLength={10}
        />

        <Select
          label="Cor/ raça"
          value={raca}
          options={racaOpts}
          onSelect={setRaca}
        />

        <Select
          label="Gênero"
          value={genero}
          options={generoOpts}
          onSelect={setGenero}
        />

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setTermos(!termos)}
        >
          <View style={[styles.checkbox, termos && styles.checked]}>
            {termos && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            Concordo com os Termos e a Política de Privacidade.
          </Text>
        </TouchableOpacity>

        <Button
          title="Próximo passo"
          onPress={handleNextStep}
          style={{ marginBottom: spacing.md }}
        />

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
  logoArea: {
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.sm,
    padding: 25,
  },
  title: {
    fontSize: 20,
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
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    borderRadius: 4,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: { backgroundColor: colors.secondary },
  checkMark: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  termsText: { flex: 1, fontSize: 15, color: colors.secondary },
  loginRow: { alignItems: "center", marginTop: 10 },
  loginText: { fontSize: 15, color: colors.textLight },
  link: { color: colors.secondary, fontWeight: "600" },
});
