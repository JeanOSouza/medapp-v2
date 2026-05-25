import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme";
import Header from "../components/Header";
import api from "../../service/api";
import { useNavigation } from "@react-navigation/native";

// --- COMPONENTE DE CARD ---
function CartaoHistorico({ medCad, onPress }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.cardRow}>
          <View style={styles.info}>
            <Text style={styles.medName}>Nome: {medCad.nome_medicacao}</Text>

            <Text style={styles.medDesc}>Dosagem: {medCad.dosagem}</Text>

            <Text style={styles.medFreq}>
              Tomar a cada {medCad.frequencia}{" "}
              {medCad.frequencia >= 2 ? "horas" : "hora"}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function HistoricoScreen() {
  const [search, setSearch] = useState("");
  const [medAtivos, setMedAtivos] = useState([]);
  const [medInativos, setMedInativos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  // --- CARREGAR MEDICAMENTOS ATIVOS ---
  const loadRegistro = async () => {
    try {
      const response = await api.get("/medicamentos");
      setMedAtivos(response.data || []);
    } catch (error) {
      console.log("Erro ao carregar ativos:", error);
    }
  };

  // --- CARREGAR MEDICAMENTOS INATIVOS ---
  const loadInativos = async () => {
    try {
      const response = await api.get("/medicamentos/inativos");
      setMedInativos(response.data || []);
    } catch (error) {
      console.log("Erro ao carregar inativos:", error);
    }
  };

  // --- REFRESH ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadRegistro(), loadInativos()]);
    setRefreshing(false);
  }, []);

  // --- INICIALIZAÇÃO ---
  useEffect(() => {
    loadRegistro();
    loadInativos();
  }, []);

  // --- FILTROS ---
  const filteredAtivos = medAtivos.filter((item) =>
    item.nome_medicacao?.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredInativos = medInativos.filter((item) =>
    item.nome_medicacao?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.secondary]}
          tintColor={colors.secondary}
        />
      }
    >
      <Header />

      <Text style={styles.title}>Histórico de Medicações</Text>

      {/* BUSCA */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />

          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar medicamento..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* ATIVOS */}
      <Text style={styles.sectionTitle}>Medicações Ativas</Text>
      <View style={styles.listContent}>
        {filteredAtivos.length > 0 ? (
          filteredAtivos.map((item, index) => (
            <CartaoHistorico
              key={
                item.id_medicacao ? String(item.id_medicacao) : String(index)
              }
              medCad={item}
              onPress={() =>
                navigation.navigate("DescricaoRemedio", {
                  medicamento: item,
                })
              }
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum medicamento ativo encontrado.
            </Text>
          </View>
        )}
      </View>

      {/* INATIVOS */}
      <Text style={styles.sectionTitle}>Medicações Inativas</Text>
      <View style={styles.listContent}>
        {filteredInativos.length > 0 ? (
          filteredInativos.map((item, index) => (
            <CartaoHistorico
              key={
                item.id_medicacao ? String(item.id_medicacao) : String(index)
              }
              medCad={item}
              onPress={() =>
                navigation.navigate("DescricaoRemedio", {
                  medicamento: item,
                })
              }
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum medicamento inativo encontrado.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ... Os seus styles continuam exatamente iguais abaixo ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginHorizontal: spacing.md,
    marginBottom: 10,
    marginTop: 10,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
  },
  card: {
    backgroundColor: colors.cardBlue,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  medDesc: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  medFreq: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
    fontWeight: "500",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
  },
});
