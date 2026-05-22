import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "../../service/api";
import { colors, spacing } from "../theme";
import Header from "../components/Header";
import Input from "../components/Input";
import Button from "../components/Button";

export default function CadastroMedicamentoScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [uso, setUso] = useState("");
  const [horario, setHorario] = useState("");
  const [tempo, setTempo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [loading, setLoading] = useState(false);

  // DATA (DD/MM/AAAA)
  const handleDataChange = (text) => {
    let val = text.replace(/\D/g, "");
    if (val.length > 8) val = val.substring(0, 8);
    if (val.length > 4) val = val.replace(/^(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
    else if (val.length > 2) val = val.replace(/^(\d{2})(\d{0,2})/, "$1/$2");
    setDataInicio(val);
  };

  // HORA (HH:MM)
  const handleHorarioChange = (text) => {
    let val = text.replace(/\D/g, "");
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) val = val.replace(/^(\d{2})(\d{0,2})/, "$1:$2");
    setHorario(val);
  };

  async function handleSalvar() {
    if (!nome || !horario || !dataInicio) {
      Alert.alert("Erro", "Nome, Horário e Data de Início são obrigatórios.");
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Erro", "Sessão expirada.");
        navigation.navigate("Login");
        return;
      }

      // converte DD/MM/AAAA → AAAA-MM-DD
      const [dia, mes, ano] = dataInicio.split("/");
      const dataParaBanco = `${ano}-${mes}-${dia}`;

      await api.post(
        "/medicamentos",
        {
          nome_medicacao: nome,
          dosagem: uso,
          descricao: descricao,
          inicio_medicacao: dataParaBanco,
          frequencia: parseInt(tempo) || 8,
          ultimadose: horario,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Alert.alert("Sucesso", "Medicamento cadastrado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.log("Erro:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível salvar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Header />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Cadastro de Medicamentos</Text>

        <Input
          label="Nome do medicamento:"
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Amoxicilina"
        />

        <Input
          label="Dosagem (Uso):"
          value={uso}
          onChangeText={setUso}
          placeholder="Ex: 500mg ou 1 comprimido"
        />

        <Input
          label="Horário da última dose:"
          value={horario}
          onChangeText={handleHorarioChange}
          placeholder="Ex: 08:00"
          keyboardType="numeric"
          maxLength={5}
        />

        <Input
          label="Frequência (horas):"
          value={tempo}
          onChangeText={setTempo}
          placeholder="Ex: 8"
          keyboardType="numeric"
        />

        <Input
          label="Data de início (controle):"
          value={dataInicio}
          onChangeText={handleDataChange}
          placeholder="DD/MM/AAAA"
          keyboardType="numeric"
          maxLength={10}
        />

        <Input
          label="Descrição (Opcional):"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Ex: Tomar após o almoço"
          multiline
        />

        {loading ? (
          <ActivityIndicator
            color={colors.secondary}
            style={{ marginTop: spacing.md }}
          />
        ) : (
          <Button
            title="Salvar Medicamento"
            onPress={handleSalvar}
            style={{ marginTop: spacing.md }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.secondary,
    fontStyle: "italic",
    marginBottom: spacing.lg,
    textAlign: "center",
  },
});
