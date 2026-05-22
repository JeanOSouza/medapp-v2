import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../theme";
import api from "../../service/api";
import Header from "../components/Header";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const dataInicio = (inicio_medicacao) => {
  if (!inicio_medicacao) return "---";

  try {
    const data = new Date(inicio_medicacao);

    // Altere de getDay() para getDate()
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    console.log("Erro ao pegar data", error);
    return "---";
  }
};

export default function HistoricoMedicamentoScreen({ route }) {
  const { medicamento } = route.params;

  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    loadHistorico();
  }, []);

  async function loadHistorico() {
    try {
      const response = await api.get(`/historico/${medicamento.id_medicacao}`);

      setHistorico(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.HistoricCard}>
        <Text style={styles.CardTextHistoricCard}>
          Histórico - {medicamento.nome_medicacao}
        </Text>

        {/*Dose*/}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="pill" size={15} color="black" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>
              Dose: {medicamento.dosagem || "---"}{" "}
            </Text>
          </View>
        </View>

        {/*Inicio*/}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-number-outline" size={15} color="black" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>
              Inicio: {dataInicio(medicamento.inicio_medicacao)}
            </Text>
          </View>
        </View>

        {/*Frequencia*/}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={15} color="black" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>
              Tomar a cada {""} {medicamento.frequencia}{" "}
              {medicamento.frequencia >= 2 ? "horas" : "hora"}
            </Text>
          </View>
        </View>

        {/*Descrição*/}
        <View style={styles.infoRow}>
          <Ionicons name="document" size={15} color="black" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>
              Informação: {medicamento.descricao || "---"}{" "}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={historico}
        keyExtractor={(item) => item.id_historico.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum medicamento encontrado.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.hora}>
              {new Date(item.data_tomada).toLocaleString()}
            </Text>

            {item.observacao && <Text>{item.observacao}</Text>}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 10,
    flexGrow: 1, // Crucial para o RefreshControl funcionar
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },

  hora: {
    fontSize: 18,
    fontWeight: "bold",
  },

  status: {
    marginTop: 4,
    marginBottom: 4,
    color: "green",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
  },

  HistoricCard: {
    alignItems: "left",
    padding: 20,
    backgroundColor: colors.cardBlue,
  },

  CardTextHistoricCard: { fontSize: 16, fontWeight: "600" },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    padding: 5,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    textTransform: "uppercase",
    fontWeight: "500",
  },
});
