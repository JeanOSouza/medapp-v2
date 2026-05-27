import React, { useState, useEffect, useCallback } from "react";
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
import * as Notifications from "expo-notifications";

import { colors, spacing, radius } from "../theme";
import Header from "../components/Header";
import ScreenWrapper from "../components/ScreenWrapper";
import api from "../../service/api";

// ======================================================
// NOTIFICAÇÕES
// ======================================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ======================================================
// MODAL
// ======================================================

function ModalHoraAtrasada({ visible, onConfirm, onCancel }) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");

  function handleHorarioChange(text) {
    let valor = text.replace(/\D/g, "");

    if (valor.length > 4) {
      valor = valor.substring(0, 4);
    }

    if (valor.length >= 2) {
      valor = valor.replace(/^(\d{2})(\d+)/, "$1:$2");
    }

    setTexto(valor);

    if (erro) {
      setErro("");
    }
  }

  function handleConfirmar() {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!regex.test(texto)) {
      setErro("Digite um horário válido.");
      return;
    }

    const [hora, minuto] = texto.split(":").map(Number);

    const data = new Date();

    data.setHours(hora);
    data.setMinutes(minuto);
    data.setSeconds(0);

    if (data > new Date()) {
      setErro("A hora não pode ser futura.");
      return;
    }

    setTexto("");
    setErro("");

    onConfirm(data);
  }

  function handleCancelar() {
    setTexto("");
    setErro("");

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

          <Text style={modalStyles.descricao}>Que horas você tomou?</Text>

          <TextInput
            style={[modalStyles.input, erro && modalStyles.inputErro]}
            placeholder="HH:mm"
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
              <Text>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.btnConfirmar}
              onPress={handleConfirmar}
            >
              <Text style={{ color: "#fff" }}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ======================================================
// CARD
// ======================================================

function MedCard({ med, resultado, onDelete, onCheck, navigation }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("DescricaoRemedio", {
          medicamento: med,
        })
      }
    >
      <View
        style={[styles.card, resultado.status === "atrasado" && styles.cardHL]}
      >
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
                  fontWeight: "700",
                  color: "#255803",
                },
              ]}
            >
              Próxima: {resultado.horario}
            </Text>

            {resultado.status === "atrasado" && (
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

// ======================================================
// HISTÓRICO
// ======================================================

function Tomados({ hist, med }) {
  const data = new Date(hist.data_tomada);

  const hora = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dia = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <View style={styles.card}>
      <Text style={styles.medName}>{hist.nome_medicacao || "Medicamento"}</Text>

      <Text style={styles.medDesc}>
        Tomado em {dia} às {hora}
      </Text>
    </View>
  );
}

// ======================================================
// HOME
// ======================================================

export default function HomeScreen({ navigation }) {
  const [tab, setTab] = useState("ativos");

  const [search, setSearch] = useState("");

  const [meds, setMeds] = useState([]);

  const [hist, setHist] = useState([]);

  const [refreshing, setRefreshing] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);

  const [idSendoMarcado, setIdSendoMarcado] = useState(null);

  useEffect(() => {
    solicitarPermissoes();
    carregarTudo();
  }, []);

  const carregarTudo = useCallback(async () => {
    try {
      const [historicoResponse, medsResponse] = await Promise.all([
        api.get("historico/porusuario"),
        api.get("medicamentos"),
      ]);

      const novoHistorico = [...historicoResponse.data];

      const novosMeds = [...medsResponse.data];

      setHist(novoHistorico);

      setMeds(novosMeds);

      await agendarLembretes(novosMeds, novoHistorico);
    } catch (error) {
      console.log(error);
    }
  }, []);

  // ======================================================
  // PERMISSÃO
  // ======================================================

  async function solicitarPermissoes() {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Aviso", "Ative as notificações.");
    }
  }

  function getUltimaTomada(idMedicacao, historicoAtual = hist) {
    const lista = historicoAtual
      .filter((h) => String(h.id_medicacao) === String(idMedicacao))
      .sort((a, b) => new Date(b.data_tomada) - new Date(a.data_tomada));

    return lista[0];
  }

  function getProximaDose(medicamento, historicoAtual = hist) {
    if (!medicamento) {
      return {
        horario: "---",
        status: "ok",
      };
    }

    const ultimaTomada = getUltimaTomada(
      medicamento.id_medicacao,
      historicoAtual,
    );

    let dataReferencia = null;

    // 1. SE JÁ FOI TOMADO AO MENOS UMA VEZ: Usa o histórico
    if (ultimaTomada?.data_tomada) {
      const parsed = new Date(ultimaTomada.data_tomada);
      if (!isNaN(parsed.getTime())) {
        dataReferencia = parsed;
      }
    }

    // 2. SE NUNCA FOI TOMADO: ignora data de início e assume o dia de hoje com o horário planejado
    if (!dataReferencia) {
      const agora = new Date();
      const ano = agora.getFullYear();
      const mes = String(agora.getMonth() + 1).padStart(2, "0");
      const dia = String(agora.getDate()).padStart(2, "0");

      const horaMinuto = medicamento.ultimadose || "00:00";

      const parsed = new Date(`${ano}-${mes}-${dia}T${horaMinuto}:00`);

      if (!isNaN(parsed.getTime())) {
        dataReferencia = parsed;
      }
    }

    if (!dataReferencia) {
      return {
        horario: "---",
        status: "ok",
      };
    }

    const frequencia = parseInt(medicamento.frequencia) || 8;

    const proximaDose = new Date(
      dataReferencia.getTime() + frequencia * 60 * 60 * 1000,
    );

    const agora = new Date();

    const atrasado = proximaDose < agora;

    const horario = proximaDose.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      day:
        proximaDose.toLocaleDateString() !== agora.toLocaleDateString()
          ? "2-digit"
          : undefined,
      month:
        proximaDose.toLocaleDateString() !== agora.toLocaleDateString()
          ? "2-digit"
          : undefined,
    });

    return {
      horario,
      status: atrasado ? "atrasado" : "ok",
    };
  }

  // ======================================================
  // NOTIFICAÇÕES (AJUSTADO À NOVA LÓGICA DE CÁLCULO)
  // ======================================================

  async function agendarLembretes(listaMedicamentos, historicoAtual) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      for (const med of listaMedicamentos) {
        const resultado = getProximaDose(med, historicoAtual);

        if (resultado.horario === "---") {
          continue;
        }

        const ultimaTomada = getUltimaTomada(med.id_medicacao, historicoAtual);
        let referencia;

        if (ultimaTomada?.data_tomada) {
          referencia = new Date(ultimaTomada.data_tomada);
        } else {
          const agora = new Date();
          const ano = agora.getFullYear();
          const mes = String(agora.getMonth() + 1).padStart(2, "0");
          const dia = String(agora.getDate()).padStart(2, "0");
          const horaMinuto = med.ultimadose || "00:00";
          referencia = new Date(`${ano}-${mes}-${dia}T${horaMinuto}:00`);
        }

        const trigger = new Date(
          referencia.getTime() +
            (parseInt(med.frequencia) || 8) * 60 * 60 * 1000,
        );

        if (trigger < new Date()) {
          continue;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `💊 ${med.nome_medicacao}`,
            body: "Hora do medicamento.",
            sound: true,
          },

          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: trigger,
          },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  // ======================================================
  // REFRESH
  // ======================================================

  async function onRefresh() {
    setRefreshing(true);

    await carregarTudo();

    setRefreshing(false);
  }

  // ======================================================
  // SALVAR HISTÓRICO (PRESERVANDO FUSO HORÁRIO LOCAL)
  // ======================================================

  async function executarSalvarHistorico(id, dataBase) {
    try {
      const ano = dataBase.getFullYear();
      const mes = String(dataBase.getMonth() + 1).padStart(2, "0");
      const dia = String(dataBase.getDate()).padStart(2, "0");
      const hora = String(dataBase.getHours()).padStart(2, "0");
      const minuto = String(dataBase.getMinutes()).padStart(2, "0");
      const segundo = String(dataBase.getSeconds()).padStart(2, "0");

      const dataFormatada = `${ano}-${mes}-${dia}T${hora}:${minuto}:${segundo}`;

      await api.post(`/historico/${id}`, {
        data_tomada: dataFormatada,
      });

      await carregarTudo();

      Alert.alert("Sucesso", "Dose registrada.");
    } catch (error) {
      console.log(error);

      Alert.alert("Erro", "Falha ao registrar.");
    }
  }

  async function marcarComoTomado(id) {
    const med = meds.find((m) => m.id_medicacao === id);

    const resultado = getProximaDose(med);

    if (resultado.status === "atrasado") {
      setIdSendoMarcado(id);

      setModalVisivel(true);

      return;
    }

    await executarSalvarHistorico(id, new Date());
  }

  // ======================================================
  // DELETE
  // ======================================================

  async function deletarMedicacao(id) {
    Alert.alert("Excluir", "Deseja excluir?", [
      {
        text: "Não",
      },

      {
        text: "Sim",

        onPress: async () => {
          try {
            await api.delete(`/medicamentosApagar/${id}`);

            await carregarTudo();
          } catch (error) {
            console.log(error);
          }
        },
      },
    ]);
  }

  // ======================================================
  // FILTRO
  // ======================================================

  const filteredMeds = [...meds].filter((m) =>
    m.nome_medicacao?.toLowerCase().includes(search.toLowerCase()),
  );

  // ======================================================
  // RENDER
  // ======================================================

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
          ? filteredMeds.map((item) => {
              const resultado = getProximaDose(item);

              return (
                <MedCard
                  key={`${item.id_medicacao}-${hist.length}`}
                  med={item}
                  resultado={resultado}
                  onDelete={deletarMedicacao}
                  onCheck={marcarComoTomado}
                  navigation={navigation}
                />
              );
            })
          : hist.map((item) => {
              const med = meds.find(
                (m) => String(m.id_medicacao) === String(item.id_medicacao),
              );

              return <Tomados key={item.id_historico} hist={item} med={med} />;
            })}
      </ScreenWrapper>
    </View>
  );
}

// ======================================================
// MODAL STYLES
// ======================================================

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
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
    marginBottom: spacing.md,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: radius.sm,
    height: 44,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    textAlign: "center",
  },

  inputErro: {
    borderColor: colors.error,
  },

  erro: {
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.md,
  },

  botoes: {
    flexDirection: "row",
    gap: spacing.md,
  },

  btnCancelar: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },

  btnConfirmar: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
});

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
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

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },

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

  tabActive: {
    backgroundColor: colors.secondary,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textLight,
  },

  tabTextActive: {
    color: "#fff",
  },

  card: {
    backgroundColor: colors.cardBlue,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },

  cardHL: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },

  cardRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },

  img: {
    width: 46,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    flex: 1,
  },

  medName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    fontStyle: "italic",
  },

  medDesc: {
    fontSize: 16,
    color: colors.text,
    marginTop: 2,
  },

  badge: {
    backgroundColor: colors.error,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 5,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

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
