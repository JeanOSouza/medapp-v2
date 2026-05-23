import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { colors, spacing, radius } from "../theme";
import api from "../../service/api";
import Header from "../components/Header";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Formata a data de início (corrige o problema de usar getDay ao invés de getDate)
const dataInicio = (inicio_medicacao) => {
  if (!inicio_medicacao) return "---";

  try {
    const data = new Date(inicio_medicacao);
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    console.log("Erro ao pegar data de início", error);
    return "---";
  }
};

// FUNÇÃO ATUALIZADA: Trata o formato "DD/MM/AAAA HH:mm" direto do banco
const formatarDataTomada = (dataString) => {
  if (!dataString) return "---";

  try {
    // Se a string já vem com a barra (Ex: 22/05/2026 11:00:00 ou 22/05/2026 11:00)
    if (dataString.includes("/")) {
      // Divide a string pelo espaço para separar a data da hora
      const partes = dataString.split(" ");
      const dataPT = partes[0]; // "22/05/2026"

      // Pega apenas a Hora:Minuto (ignora os segundos se houver)
      const horaCompleta = partes[1] || "";
      const horaMinuto = horaCompleta.substring(0, 5); // "11:00"

      return `${dataPT} às ${horaMinuto}`;
    }

    // Caso o banco envie em formato ISO antigo por algum motivo, mantém um fallback seguro:
    const match = dataString.match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
    );
    if (match) {
      const [, ano, mes, dia, hora, minutos] = match;
      return `${dia}/${mes}/${ano} às ${hora}:${minutos}`;
    }

    return dataString;
  } catch (error) {
    console.log("Erro ao formatar data da tomada", error);
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

  const finalizarMedicacao = async (id) => {
    try {
      await api.put(`/medicamentos/${id}/finalizar`);
      Alert.alert("Sucesso", "Medicação finalizada");
      loadHistorico();
    } catch (error) {
      console.log(error, "Nao foi possivel atualizar status");
    }
  };

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
              Dose: {medicamento.dosagem || "---"}
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
              Tomar a cada {medicamento.frequencia}{" "}
              {medicamento.frequencia >= 2 ? "horas" : "hora"}
            </Text>
          </View>
        </View>

        {/*Descrição*/}
        <View style={styles.infoRow}>
          <Ionicons name="document" size={15} color="black" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>
              Informação: {medicamento.descricao || "---"}
            </Text>
          </View>
        </View>

        {/*Status (Corrigido para mapear a propriedade correta de status do seu banco)*/}
        <View style={styles.infoRow}>
          <Ionicons name="stats-chart" size={15} color="black" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>
              Status: {medicamento.status || "Ativo"}
            </Text>
          </View>
        </View>

        <View style={styles.botao}>
          <TouchableOpacity
            style={styles.btnFinalizar}
            onPress={() => finalizarMedicacao(medicamento.id_medicacao)}
          >
            <Text style={styles.labelFinalizar}>finalizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        // Filtra o histórico para garantir que só exibe o que realmente foi tomado e pertence a este remédio
        data={historico.filter((item) => {
          // 1. Garante que o registro pertence estritamente a este medicamento
          const pertenceAoMed =
            String(item.id_medicacao) === String(medicamento.id_medicacao);

          // 2. Garante que a data existe e não é uma linha vazia ou corrompida
          const temData = !!item.data_tomada;

          return pertenceAoMed && temData;
        })}
        keyExtractor={(item) => item.id_historico.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum registro de dose tomada.
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.hora}>
              {formatarDataTomada(item.data_tomada)}
            </Text>

            {item.observacao && (
              <Text style={styles.observacao}>{item.observacao}</Text>
            )}
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
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2, // Uma leve sombra para destacar o card
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  hora: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  observacao: {
    marginTop: 6,
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
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
    padding: 20,
    backgroundColor: colors.cardBlue,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    position: "relative",
  },
  CardTextHistoricCard: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  labelFinalizar: {
    fontSize: 13,
    textTransform: "uppercase",
    fontWeight: "700",
    color: "#FFF",
  },
  botao: {
    alignItems: "center",
    marginTop: 10,
  },
  btnFinalizar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#e92828",
    justifyContent: "center",
    alignItems: "center",
  },
});
