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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";

import { colors, spacing, radius } from "../theme";
import Header from "../components/Header";
import ScreenWrapper from "../components/ScreenWrapper";
import api from "../../service/api";

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
      setErro("Formato inválido. Use HH:mm");
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
        navigation.navigate("DescricaoRemedio", {
          medicamento: med,
        })
      }
    >
      <View style={styles.card}>
        <View style={styles.info}>
          <Text style={styles.medName}>{med.nome_medicacao}</Text>

          <Text style={styles.medDesc}>
            {med.dosagem} - {med.descricao}
          </Text>

          <Text style={styles.proximaDoseText}>Próxima: {proximaDose}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnGreen}
            onPress={() => onCheck(med.id_medicacao)}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnRed}
            onPress={() => onDelete(med.id_medicacao)}
          >
            <Ionicons name="close" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function Tomados({ hist, med }) {
  let dataObjeto = new Date();

  if (hist?.data_tomada) {
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

  const [modalVisivel, setModalVisivel] = useState(false);
  const [idSendoMarcado, setIdSendoMarcado] = useState(null);

  useEffect(() => {
    async function testeToken() {
      const token = await AsyncStorage.getItem("token");

      console.log("TOKEN SALVO:", token);
    }

    testeToken();

    solicitarPermissoes();
    onRefresh();
  }, []);

  async function solicitarPermissoes() {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Aviso", "Ative as notificações para receber lembretes.");
    }
  }

  async function agendarLembretes(listaMedicamentos) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      for (const item of listaMedicamentos) {
        const data = new Date(Date.now() + 10000);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: `💊 ${item.nome_medicacao}`,
            body: "Hora de tomar seu medicamento.",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: data,
          },
        });
      }
    } catch (e) {
      console.log("Erro notificação:", e);
    }
  }

  const loadHistorico = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await api.get("historico/todos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHist(response.data);

      return response.data;
    } catch (error) {
      console.log("Erro hist:", error);
      return [];
    }
  };

  const loadMedicacoes = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await api.get("medicamentos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMeds(response.data);

      if (response.data.length > 0) {
        await agendarLembretes(response.data);
      }
    } catch (error) {
      console.log("Erro meds:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);

    await loadHistorico();
    await loadMedicacoes();

    setRefreshing(false);
  };

  useEffect(() => {
    solicitarPermissoes();
    onRefresh();
  }, []);

  async function executarSalvarHistorico(id, dataFinal) {
    try {
      const token = await AsyncStorage.getItem("token");

      await api.post(
        `/historico/${id}`,
        {
          data_tomada: dataFinal,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await onRefresh();

      Alert.alert("Sucesso", "Dose registrada!");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível registrar.");
    }
  }

  async function marcarComoTomado(id) {
    await executarSalvarHistorico(id, new Date());
  }

  async function deletarMedicacao(id) {
    Alert.alert("Excluir", "Deseja excluir?", [
      {
        text: "Cancelar",
      },
      {
        text: "Sim",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");

            await api.delete(`/medicamentosApagar/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            await loadMedicacoes();
          } catch (error) {
            console.log(error);
          }
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
          <Text style={styles.tabText}>ATIVOS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === "tomados" && styles.tabActive]}
          onPress={() => setTab("tomados")}
        >
          <Text style={styles.tabText}>TOMADOS</Text>
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
                proximaDose="Em breve"
                navigation={navigation}
              />
            ))
          : hist.map((item) => {
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
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },

  titulo: {
    fontSize: 18,
    fontWeight: "700",
  },

  descricao: {
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 15,
  },

  inputErro: {
    borderColor: "red",
  },

  erro: {
    color: "red",
    marginTop: 5,
  },

  botoes: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },

  btnCancelar: {
    flex: 1,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
  },

  btnCancelarTexto: {
    fontWeight: "600",
  },

  btnConfirmar: {
    flex: 1,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 10,
  },

  btnConfirmarTexto: {
    color: "#fff",
    fontWeight: "700",
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
    borderRadius: 999,
    paddingHorizontal: 15,
    height: 46,
    gap: 10,
    marginBottom: 20,
    marginTop: 10,
  },

  searchInput: {
    flex: 1,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: colors.cardBlue,
    borderRadius: 999,
    padding: 4,
    marginBottom: 15,
  },

  tab: {
    flex: 1,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 999,
  },

  tabActive: {
    backgroundColor: colors.secondary,
  },

  tabText: {
    color: "#fff",
    fontWeight: "700",
  },

  card: {
    backgroundColor: colors.cardBlue,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },

  info: {
    flex: 1,
  },

  medName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },

  medDesc: {
    marginTop: 5,
    fontSize: 15,
  },

  proximaDoseText: {
    marginTop: 5,
    color: "green",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15,
    marginTop: 15,
  },

  btnGreen: {
    width: 60,
    height: 40,
    borderRadius: 12,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
  },

  btnRed: {
    width: 60,
    height: 40,
    borderRadius: 12,
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
});
