import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme";
import Header from "../components/Header";
import ScreenWrapper from "../components/ScreenWrapper";
import api from "../../service/api";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function ModalHoraAtrasada({ visible, onConfirm, onCancel }) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");

  const handleHorarioChange = (text) => {
    let val = text.replace(/\D/g, "");

    if (val.length > 4) val = val.substring(0, 4);

    if (val.length >= 2) {
      const horas = parseInt(val.substring(0, 2), 10);
      if (horas > 23) val = "23" + val.substring(2);
    }

    if (val.length === 4) {
      const minutos = parseInt(val.substring(2, 4), 10);
      if (minutos > 59) val = val.substring(0, 2) + "59";
    }

    if (val.length > 2) {
      val = val.replace(/^(\d{2})(\d{0,2})/, "$1:$2");
    }

    if (erro) setErro("");
    setTexto(val);
  };

  function handleConfirmar() {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!regex.test(texto)) {
      setErro("Formato inválido. Use HH:mm (ex: 14:30)");
      return;
    }

    const [horas, minutos] = texto.split(":").map(Number);
    const data = new Date();
    data.setHours(horas, minutos, 0, 0);

    if (data > new Date()) {
      setErro("A hora não pode ser no futuro.");
      return;
    }

    setErro("");
    setTexto("");
    onConfirm(data);
  }

  function handleCancelar() {
    setErro("");
    setTexto("");
    onCancel();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={modalStyles.overlay}
      >
        <View style={modalStyles.box}>
          <View style={modalStyles.header}>
            <Ionicons name="time-outline" size={22} color={colors.secondary} />
            <Text style={modalStyles.titulo}>Remédio atrasado</Text>
          </View>

          <Text style={modalStyles.descricao}>
            Que horas você tomou este remédio?
          </Text>

          <TextInput
            style={[modalStyles.input, erro ? modalStyles.inputErro : null]}
            placeholder="HH:mm  (ex: 14:30)"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={texto}
            onChangeText={handleHorarioChange}
            autoFocus
          />

          {erro ? <Text style={modalStyles.erro}>{erro}</Text> : null}

          <View style={modalStyles.botoes}>
            <TouchableOpacity
              style={modalStyles.btnCancelar}
              onPress={handleCancelar}
            >
              <Text style={modalStyles.btnCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.btnConfirmar}
              onPress={handleConfirmar}
            >
              <Text style={modalStyles.btnConfirmarTexto}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function MedCard({ med, onDelete, onCheck, proximaDose, navigation }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("DescricaoRemedio", { medicamento: med })
      }
    >
      <View style={[styles.card, med.status === "atrasado" && styles.cardHL]}>
        <View style={styles.cardRow}>
          <View style={styles.info}>
            <Text style={styles.medName}>{med.nome_medicacao}</Text>
            <Text style={styles.medDesc}>
              {med.dosagem} - {med.descricao}
            </Text>
            <Text style={[styles.medDesc, styles.proximaDoseText]}>
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

// CARD — HISTÓRICO (TOMADOS)
function Tomados({ hist, med }) {
  let dataObjeto = new Date();

  if (hist?.data_tomada) {
    const parsed = new Date(hist.data_tomada);
    if (!isNaN(parsed.getTime())) dataObjeto = parsed;
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
  const [modalVisivel, setModalVisivel] = useState(false);
  const [idSendoMarcado, setIdSendoMarcado] = useState(null);

  async function solicitarPermissoes() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Aviso",
        "Ative as notificações para não esquecer seus remédios.",
      );
    }
  }

  // ── Notificações ────────────────────────────
  async function agendarLembretes(listaMedicamentos, historicoAtual = []) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (!listaMedicamentos?.length) return;

      for (const item of listaMedicamentos) {
        const freqHoras = parseInt(item.frequencia) || 8;

        const ultimaTomada = historicoAtual.find(
          (h) => String(h.id_medicacao) === String(item.id_medicacao),
        );

        let dataReferencia;

        if (ultimaTomada?.data_tomada) {
          const parsed = new Date(ultimaTomada.data_tomada);
          if (!isNaN(parsed.getTime())) dataReferencia = parsed;
        }

        if (!dataReferencia && item.inicio_medicacao) {
          const apenasData = String(item.inicio_medicacao).substring(0, 10);
          const horaCadastro = item.ultimadose || "00:00";
          const parsed = new Date(`${apenasData}T${horaCadastro}:00`);
          if (!isNaN(parsed.getTime())) dataReferencia = parsed;
        }

        if (!dataReferencia) continue;

        const dataProximaDose = new Date(
          dataReferencia.getTime() + freqHoras * 60 * 60 * 1000,
        );
        const agora = new Date();

        // só agenda se a próxima dose for no futuro
        if (dataProximaDose > agora) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `💊 Hora do Remédio: ${item.nome_medicacao}`,
              body: "Está na hora de tomar o seu medicamento.",
              sound:
                Platform.OS === "ios"
                  ? "notification_sound.wav"
                  : "notification_sound.mp3",
              priority: "max",
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: dataProximaDose,
            },
          });
          console.log(
            `✅ Notificação agendada: ${item.nome_medicacao} às ${dataProximaDose.toLocaleTimeString("pt-BR")}`,
          );
        }
      }
    } catch (e) {
      console.log("Erro no agendamento:", e);
    }
  }

  // ── Próxima dose ────────────────────────────
  const getProximaDose = (medicamento, historicoAtual = hist) => {
    if (!medicamento?.frequencia) return "---";

    const ultimaTomada = historicoAtual.find(
      (h) => String(h.id_medicacao) === String(medicamento.id_medicacao),
    );

    let dataReferencia;

    if (ultimaTomada?.data_tomada) {
      const parsed = new Date(ultimaTomada.data_tomada);
      if (!isNaN(parsed.getTime())) dataReferencia = parsed;
    }

    if (!dataReferencia && medicamento.inicio_medicacao) {
      const apenasData = String(medicamento.inicio_medicacao).substring(0, 10);
      const horaCadastro = medicamento.ultimadose || "00:00";
      const parsed = new Date(`${apenasData}T${horaCadastro}:00`);
      if (!isNaN(parsed.getTime())) dataReferencia = parsed;
    }

    if (!dataReferencia) return "---";

    const horasParaAdicionar = parseInt(medicamento.frequencia) || 8;
    const proximaDoseData = new Date(
      dataReferencia.getTime() + horasParaAdicionar * 60 * 60 * 1000,
    );
    const agora = new Date();

    medicamento.status =
      proximaDoseData < agora ? "Atrasado" || "Inativo" : "Ativo";

    const eHoje =
      proximaDoseData.toLocaleDateString() === agora.toLocaleDateString();

    return proximaDoseData.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      day: eHoje ? undefined : "2-digit",
      month: eHoje ? undefined : "2-digit",
    });
  };

  // ── Carregamento ────────────────────────────
  const loadHistorico = async () => {
    try {
      const response = await api.get("historico/todos");
      setHist(response.data);
      return response.data;
    } catch (error) {
      console.log("Erro hist:", error);
      return [];
    }
  };

  const loadMedicacoes = async (historicoAtual = []) => {
    try {
      const response = await api.get("medicamentos");
      setMeds(response.data);
      if (response.data.length > 0) {
        await agendarLembretes(response.data, historicoAtual);
      }
    } catch (error) {
      console.log("Erro meds:", error);
    }
  };

  // carrega histórico primeiro, depois passa para medicações
  const onRefresh = async () => {
    setRefreshing(true);
    const historicoAtual = await loadHistorico();
    await loadMedicacoes(historicoAtual);
    setRefreshing(false);
  };

  useEffect(() => {
    solicitarPermissoes();
    onRefresh();
  }, []);

  // ── Ações ───────────────────────────────────
  async function executarSalvarHistorico(id, dataFinal) {
    try {
      await api.post(`/historico/${id}`, { data_tomada: dataFinal });
      const historicoAtual = await loadHistorico();
      await loadMedicacoes(historicoAtual);
      Alert.alert("Sucesso", "Dose registrada!");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível registrar.");
    }
  }

  async function marcarComoTomado(id) {
    const med = meds.find((m) => m.id_medicacao === id);

    if (med?.status === "atrasado") {
      setIdSendoMarcado(id);
      setModalVisivel(true);
      return;
    }

    await executarSalvarHistorico(id, new Date());
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

  // ── Render ──────────────────────────────────
  return (
    <View style={styles.container}>
      <Header />

      <ModalHoraAtrasada
        visible={modalVisivel}
        onConfirm={async (dataDigitada) => {
          setModalVisivel(false);
          if (idSendoMarcado) {
            await executarSalvarHistorico(idSendoMarcado, dataDigitada);
          }
          setIdSendoMarcado(null);
        }}
        onCancel={() => {
          setModalVisivel(false);
          setIdSendoMarcado(null);
        }}
      />

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
          : hist
              // 1. Filtra para manter apenas o histórico de remédios que ainda existem
              .filter((item) =>
                meds.some(
                  (m) => String(m.id_medicacao) === String(item.id_medicacao),
                ),
              )
              // 2. Renderiza apenas os válidos
              .map((item) => {
                const dadosMed = meds.find(
                  (m) => String(m.id_medicacao) === String(item.id_medicacao),
                );
                return (
                  <Tomados key={item.id_historico} hist={item} med={dadosMed} />
                );
              })}
      </ScreenWrapper>
    </View>
  );
}

// ─────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  box: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.lg,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  descricao: {
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.sm,
    backgroundColor: "#fafafa",
  },
  inputErro: {
    borderColor: colors.error,
  },
  erro: {
    color: colors.error,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  botoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  btnCancelar: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  btnCancelarTexto: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  btnConfirmar: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
  },
  btnConfirmarTexto: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

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
  info: { flex: 1, paddingLeft: 10 },
  medName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    fontStyle: "italic",
  },
  medDesc: { fontSize: 18, color: colors.text, marginTop: 2 },
  proximaDoseText: { fontWeight: "500", color: "#255803", textAlign: "left" },
  badge: {
    backgroundColor: colors.error,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },
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
