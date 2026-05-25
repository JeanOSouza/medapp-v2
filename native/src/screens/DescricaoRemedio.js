import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, radius } from "../theme";
import api from "../../service/api";
import Header from "../components/Header";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Formata a data de início
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

// Trata o formato de data vindo do banco (ISO ou string formatada)
const formatarDataTomada = (dataString) => {
  if (!dataString) return "---";

  try {
    if (dataString.includes("/")) {
      const partes = dataString.split(" ");
      const dataPT = partes[0];
      const horaCompleta = partes[1] || "";
      const horaMinuto = horaCompleta.substring(0, 5);

      return `${dataPT} às ${horaMinuto}`;
    }

    const match = dataString.match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
    );
    if (match) {
      const [, ano, mes, dia, hora, minutos] = match;
      return `${dia}/${mes}/${ano} às ${hora}:${minutos}`;
    }

    // Fallback caso venha como objeto Date nativo do JS
    const dataObj = new Date(dataString);
    if (!isNaN(dataObj)) {
      const dia = String(dataObj.getDate()).padStart(2, "0");
      const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
      const ano = dataObj.getFullYear();
      const hora = String(dataObj.getHours()).padStart(2, "0");
      const minutos = String(dataObj.getMinutes()).padStart(2, "0");
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

  // 💡 ESTADO LOCAL: Controla o status na tela sem depender apenas do route.params estático
  const [statusAtual, setStatusAtual] = useState(medicamento.status || "Ativo");

  useEffect(() => {
    loadHistorico();
  }, []);

  async function loadHistorico() {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await api.get(`/historico/${medicamento.id_medicacao}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistorico(response.data);
    } catch (error) {
      console.log("Erro ao carregar histórico:", error);
    }
  }

  const ativarRemedio = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");

      // 🔄 Corrigida a rota e adicionado os headers de autenticação
      await api.put(
        `/medicamentos/${id}/reativar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Alert.alert("Sucesso", "Medicação ativa novamente!");
      setStatusAtual("Ativo"); // Atualiza o texto do card em tempo real
      loadHistorico();
    } catch (error) {
      console.log("Não foi possível atualizar status ATIVO", error);
      Alert.alert("Erro", "Não foi possível reativar o medicamento.");
    }
  };

  const finalizarMedicacao = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");

      // 🔄 Adicionado os headers de autenticação
      await api.put(
        `/medicamentos/${id}/finalizar`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Alert.alert("Sucesso", "Medicação finalizada!");
      setStatusAtual("Inativo"); // Atualiza o texto do card em tempo real
      loadHistorico();
    } catch (error) {
      console.log("Não foi possível atualizar status INATIVO", error);
      Alert.alert("Erro", "Não foi possível finalizar o medicamento.");
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.HistoricCard}>
        <Text style={styles.CardTextHistoricCard}>
          Histórico - {medicamento.nome_medicacao}
        </Text>

        {/* Dose */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="pill" size={15} color="black" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>
              Dose: {medicamento.dosagem || "---"}
            </Text>
          </View>
        </View>

        {/* Inicio */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-number-outline" size={15} color="black" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>
              Inicio: {dataInicio(medicamento.inicio_medicacao)}
            </Text>
          </View>
        </View>

        {/* Frequencia */}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={15} color="black" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>
              Tomar a cada {medicamento.frequencia}{" "}
              {medicamento.frequencia >= 2 ? "horas" : "hora"}
            </Text>
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.infoRow}>
          <Ionicons name="document" size={15} color="black" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>
              Informação: {medicamento.descricao || "---"}
            </Text>
          </View>
        </View>

        {/* Status Dinâmico */}
        <View style={styles.infoRow}>
          <Ionicons name="stats-chart" size={15} color="black" />
          <View style={styles.textGroup}>
            <Text style={styles.label}>Status: {statusAtual}</Text>
          </View>
        </View>

        {/* Botões de Ação lado a lado */}
        <View style={styles.labelopcoes}>
          <TouchableOpacity
            style={styles.btnFinalizar}
            onPress={() => finalizarMedicacao(medicamento.id_medicacao)}
          >
            <Text style={styles.labelFinalizar}>Finalizar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnAtivar}
            onPress={() => ativarRemedio(medicamento.id_medicacao)}
          >
            <Text style={styles.labelAtivar}>Reativar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={historico.filter((item) => {
          const pertenceAoMed =
            String(item.id_medicacao) === String(medicamento.id_medicacao);
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
    elevation: 2,
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
    marginBottom: 10,
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
  labelopcoes: {
    flexDirection: "row",
    gap: 15,
    marginTop: 15,
    justifyContent: "space-between",
  },
  labelFinalizar: {
    fontSize: 13,
    textTransform: "uppercase",
    fontWeight: "700",
    color: "#FFF",
  },
  labelAtivar: {
    fontSize: 13,
    textTransform: "uppercase",
    fontWeight: "700",
    color: "#000",
  },
  btnFinalizar: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#e92828",
    justifyContent: "center",
    alignItems: "center",
  },
  btnAtivar: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#27f014",
    justifyContent: "center",
    alignItems: "center",
  },
});
