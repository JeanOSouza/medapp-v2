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
import Checkbox from "expo-checkbox";
import { colors, spacing } from "../theme";
import Logo from "../components/Logo";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
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
        data: dataParaBanco, // Aqui já vai no padrão do SQLite/PostgreSQL
        raca,
        genero,
        cidade,
        estado,
      },
    });
  };

  return (
    // Definimos a cor de fundo nativa na SafeAreaView para evitar o buraco branco
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        // No Android, o comportamento nativo (undefined) funciona perfeitamente com ScrollView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
            label="Digite o nome da cidade em que reside"
            value={cidade}
            onChangeText={setCidade}
            placeholder="Ex: Viçosa"
          />

          <Input
            label="Digite o estado de residencia"
            value={estado}
            onChangeText={setEstado}
            placeholder="Ex: Minas Gerais"
          />

          <Input
            label="Data de nascimento"
            value={data}
            onChangeText={handleDataChange}
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

          {/* SESSÃO DOS TERMOS ADAPTADA COM O CLICK */}
          <View style={styles.termsRow}>
            <Checkbox
              value={termos}
              onValueChange={setTermos}
              color={termos ? colors.secondary : undefined}
              style={styles.checkbox}
            />
            <Text style={styles.termsText}>
              Concordo com os{" "}
              {/* O texto agora é clicável e chama a tela de Termos */}
              <Text
                style={styles.linkUnderline}
                onPress={() => navigation.navigate("Termos")}
              >
                Termos e a Política de Privacidade
              </Text>
              .
            </Text>
          </View>

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
    </SafeAreaView>
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
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    borderRadius: 4,
  },
  termsText: { flex: 1, fontSize: 15, color: colors.secondary },
  linkUnderline: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  loginRow: { alignItems: "center", marginTop: 10 },
  loginText: { fontSize: 15, color: colors.textLight },
  link: { color: colors.secondary, fontWeight: "600" },
});
