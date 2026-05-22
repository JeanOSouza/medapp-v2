import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
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
              Tomar a cada {""} {medCad.frequencia}{" "}
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
  const [medCad, setMedCad] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();

  // Função para carregar registros
  const loadRegistro = async () => {
    try {
      const response = await api.get("medicamentos");
      setMedCad(response.data);
    } catch (error) {
      console.log("Erro ao carregar registros:", error);
    }
  };

  // Função de Refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRegistro();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadRegistro();
  }, []);

  // Filtro de busca
  const filteredData = medCad.filter((item) =>
    item.nome_medicacao?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <Header />

      <Text style={styles.title}>Ultimos Tomados</Text>

      {/* Caixa de Busca */}
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

      {/* Lista Principal */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => String(item.id_medicacao)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.secondary]} // Android
            tintColor={colors.secondary} // iOS
            progressViewOffset={20}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum medicamento encontrado.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <CartaoHistorico
            medCad={item}
            onPress={() =>
              navigation.navigate("DescricaoRemedio", {
                medicamento: item,
              })
            }
          />
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
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
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
    paddingBottom: 40,
    flexGrow: 1, // Crucial para o RefreshControl funcionar
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
