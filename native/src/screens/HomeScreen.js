import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Button } from "../components/Button";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme";
import Header from "../components/Header";
import ScreenWrapper from "../components/ScreenWrapper";
import api from "../../service/api";
import * as Notifications from "expo-notifications";

// --- CONFIGURAÇÃO DE NOTIFICAÇÕES ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function MedCard({ med, onDelete, onCheck, proximaDose, navigation }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("DescricaoRemedio", {
          medicamento: med,
        })
      }
    >
      <View style={[styles.card, med.status === "atrasado" && styles.cardHL]}>
        <View style={styles.cardRow}>
          <View style={styles.img}>
            <Ionicons name="medical" size={22} color={colors.primary} />
          </View>

          <View style={styles.info}>
            <Text style={styles.medName}>{med.nome_medicacao}</Text>

            <Text style={styles.medDesc}>
              {med.dosagem} - {med.descricao}
            </Text>

            <Text
              style={[
                styles.medDesc,
                {
                  fontWeight: "500",
                  color: "#255803",
                  textAlign: "left",
                },
              ]}
            >
              Próxima: {proximaDose}
            </Text>

            {med.status === "atrasado" && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Atrasado</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnGreen}
            onPress={() => onCheck(med.id_medicacao)}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnRed}
            onPress={() => onDelete(med.id_medicacao)}
          >
            <Ionicons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// --- COMPONENTE DO CARD DE HISTÓRICO (TOMADOS - BLINDADO) ---
function Tomados({ hist, med }) {
  let dataObjeto = new Date();

  if (hist && hist.data_tomada) {
    const parsed = new Date(hist.data_tomada);
    if (!isNaN(parsed.getTime())) {
      dataObjeto = parsed;
    }
  }

  const hora = dataObjeto.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dia = dataObjeto.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.medName}>{med?.nome_medicacao || "Remédio"}</Text>
        <Text style={styles.medDesc}>
          Tomado em: {dia} às {hora}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const [tab, setTab] = useState("ativos");
  const [search, setSearch] = useState("");
  const [meds, setMeds] = useState([]);
  const [hist, setHist] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showHoraInput, setShowHoraInput] = useState(false);
  const [medSelecionado, setMedSelecionado] = useState(null);
  const [horaTomada, setHoraTomada] = useState("");

  // --- SOLICITAR PERMISSÃO DE ALARMES ---
  async function solicitarPermissoes() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Aviso",
        "Ative as notificações para não esquecer seus remédios.",
      );
    }
  }

  // --- AGENDAMENTO DA PRÓXIMA DOSE APENAS SE JÀ TIVER SIDO TOMADO ---
  async function agendarLembretes(listaMedicamentos) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (!listaMedicamentos || listaMedicamentos.length === 0) return;

      for (const item of listaMedicamentos) {
        const freqHoras = parseInt(item.frequencia) || 8;

        const ultimaTomada = hist.find(
          (h) => String(h.id_medicacao) === String(item.id_medicacao),
        );

        let dataReferencia;

        if (ultimaTomada && ultimaTomada.data_tomada) {
          const parsed = new Date(ultimaTomada.data_tomada);
          if (!isNaN(parsed.getTime())) dataReferencia = parsed;
        }

        // SE NÃO TIVER HISTÓRICO: Combina a data pura com a hora enviada no cadastro
        if (!dataReferencia) {
          const dataCadastro = item.inicio_medicacao;
          const horaCadastro = item.ultimadose || "00:00";

          if (dataCadastro) {
            const apenasData = String(dataCadastro).substring(0, 10);
            const dataLocalStr = `${apenasData}T${horaCadastro}:00`;
            const parsed = new Date(dataLocalStr);
            if (!isNaN(parsed.getTime())) dataReferencia = parsed;
          }
        }

        if (!dataReferencia) continue;

        const dataProximaDose = new Date(
          dataReferencia.getTime() + freqHoras * 60 * 60 * 1000,
        );

        const agora = new Date();
        let gatilhoNotificacao = dataProximaDose;

        if (dataProximaDose <= agora) {
          gatilhoNotificacao = new Date(agora.getTime() + 5000);
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `💊 Hora do Remédio: ${item.nome_medicacao}`,
            body: `Está na hora de tomar o seu medicamento.`,
            sound: true,
            priority: "max",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: gatilhoNotificacao,
          },
        });
      }
    } catch (e) {
      console.log("Erro no agendamento:", e);
    }
  }

  const getProximaDose = (medicamento) => {
    if (!medicamento || !medicamento.frequencia) return "---";

    const ultimaTomada = hist.find(
      (h) => String(h.id_medicacao) === String(medicamento.id_medicacao),
    );

    let dataReferencia;

    // Caso 1: Já existe um histórico de tomada
    if (ultimaTomada && ultimaTomada.data_tomada) {
      const parsed = new Date(ultimaTomada.data_tomada);
      if (!isNaN(parsed.getTime())) {
        dataReferencia = parsed;
      }
    }

    // Caso 2: Não tem histórico, monta usando os dados de cadastro
    if (!dataReferencia && medicamento.inicio_medicacao) {
      const apenasData = String(medicamento.inicio_medicacao).substring(0, 10);
      const horaCadastro = medicamento.ultimadose || "00:00";

      // Agora a string é convertida em Date com segurança no escopo correto
      const parsed = new Date(`${apenasData}T${horaCadastro}:00`);
      if (!isNaN(parsed.getTime())) {
        dataReferencia = parsed;
      }
    }

    // Se mesmo assim não conseguir gerar uma data válida, sai da função
    if (!dataReferencia) return "---";

    const horasParaAdicionar = parseInt(medicamento.frequencia) || 8;

    // Calcula o momento exato da próxima dose
    const proximaDoseData = new Date(
      dataReferencia.getTime() + horasParaAdicionar * 60 * 60 * 1000,
    );

    const agora = new Date();

    const atrasado = proximaDoseData < agora;
    medicamento.status = atrasado ? "atrasado" : "ok";
    const eHoje =
      proximaDoseData.toLocaleDateString() === agora.toLocaleDateString();

    return proximaDoseData.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      day: eHoje ? undefined : "2-digit",
      month: eHoje ? undefined : "2-digit",
    });
  };
  // --- CARREGAMENTO DE DADOS ---
  const loadMedicacoes = async () => {
    try {
      const response = await api.get("medicamentos");
      setMeds(response.data);
      if (response.data.length > 0) agendarLembretes(response.data);
    } catch (error) {
      console.log("Erro meds:", error);
    }
  };

  const loadHistorico = async () => {
    try {
      const response = await api.get("historico/todos");
      setHist(response.data);
    } catch (error) {
      console.log("Erro hist:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadMedicacoes(), loadHistorico()]);
    setRefreshing(false);
  };

  useEffect(() => {
    solicitarPermissoes();
    onRefresh();
  }, []);

  async function confirmarTomada() {
    try {
      await api.post(`/historico/${medSelecionado}`, {
        hora_tomada: new Date(horaTomada).toISOString(),
      });

      setShowHoraInput(false);
      setHoraTomada("");
      setMedSelecionado(null);

      await Promise.all([loadHistorico(), loadMedicacoes()]);
    } catch (err) {
      console.log(err);
    }
  }

  // --- AÇÕES ---
  async function marcarComoTomado(id) {
    const med = meds.find((m) => m.id_medicacao === id);

    if (med?.status === "atrasado") {
      setMedSelecionado(id);
      setShowHoraInput(true);
      return;
    }

    await api.post(`/historico/${id}`);
    await Promise.all([loadHistorico(), loadMedicacoes()]);
  }

  async function deletarMedicacao(id) {
    Alert.alert("Excluir", "Deseja excluir?", [
      { text: "Não" },
      {
        text: "Sim",
        onPress: async () => {
          await api.delete(`/medicamentosApagar/${id}`);
          loadMedicacoes();
        },
      },
    ]);
  }

  const filteredMeds = meds.filter((m) =>
    m.nome_medicacao?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <Header />

      {showHoraInput && (
        <View
          style={{
            padding: 15,
            backgroundColor: "#fff",
            marginBottom: 10,
            borderRadius: 10,
            elevation: 3,
          }}
        >
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Informe a hora que tomou o remédio:
          </Text>

          <TextInput
            placeholder="Ex: 2026-05-22T14:30"
            value={horaTomada}
            onChangeText={setHoraTomada}
            style={{
              borderWidth: 1,
              padding: 10,
              borderRadius: 8,
            }}
          />

          <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
            <Button title="Cancelar" onPress={() => setShowHoraInput(false)} />
            <Button title="Confirmar" onPress={confirmarTomada} />
          </View>
        </View>
      )}

      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "ativos" && styles.tabActive]}
          onPress={() => setTab("ativos")}
        >
          <Text
            style={[styles.tabText, tab === "ativos" && styles.tabTextActive]}
          >
            ATIVOS
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "tomados" && styles.tabActive]}
          onPress={() => setTab("tomados")}
        >
          <Text
            style={[styles.tabText, tab === "tomados" && styles.tabTextActive]}
          >
            TOMADOS
          </Text>
        </TouchableOpacity>
      </View>

      <ScreenWrapper refreshing={refreshing} onRefreshAction={onRefresh}>
        {tab === "ativos"
          ? filteredMeds.map((item) => (
              <MedCard
                key={item.id_medicacao}
                med={item}
                onDelete={deletarMedicacao}
                onCheck={marcarComoTomado}
                proximaDose={getProximaDose(item)}
                navigation={navigation}
              />
            ))
          : hist.map((item) => {
              const dadosMed = meds.find(
                (m) => String(m.id_medicacao) === String(item.id_medicacao),
              );
              return (
                <Tomados
                  key={item.id_historico}
                  hist={item}
                  med={dadosMed || { nome_medicacao: "Removido" }}
                />
              );
            })}
      </ScreenWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
    marginBottom: 20,
    marginTop: 10,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.cardBlue,
    borderRadius: radius.full,
    padding: 4,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.full,
  },
  tabActive: { backgroundColor: colors.secondary },
  tabText: { fontSize: 13, fontWeight: "700", color: colors.textLight },
  tabTextActive: { color: "#fff" },
  card: {
    backgroundColor: colors.cardBlue,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHL: { borderLeftWidth: 4, borderLeftColor: colors.secondary },
  cardRow: { flexDirection: "row", gap: spacing.sm },
  img: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1 },
  medName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    fontStyle: "italic",
  },
  medDesc: { fontSize: 16, color: colors.text, marginTop: 2 },
  badge: {
    backgroundColor: colors.error,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.md,
    justifyContent: "flex-end",
  },
  btnGreen: {
    width: 100,
    height: 40,
    borderRadius: 15,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  btnRed: {
    width: 100,
    height: 40,
    borderRadius: 15,
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
  },
});
