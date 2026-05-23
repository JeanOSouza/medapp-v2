import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PerfilScreen() {
  const [user, setUser] = useState(null);

  const loadDadosUsuario = async () => {
    try {
      const userStorage = await AsyncStorage.getItem("user");

      console.log("DADO BRUTO:", userStorage);

      if (!userStorage) {
        console.log("Nenhum usuário salvo");
        return;
      }

      const userParsed = JSON.parse(userStorage);

      console.log("USER PARSED:", userParsed);

      // Verifica se existe
      if (!userParsed) {
        console.log("userParsed veio undefined");
        return;
      }

      setUser(userParsed);
    } catch (error) {
      console.log("Erro ao carregar usuário:", error);
    }
  };
  // Calcular idade
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return "---";

    try {
      const nascimento = new Date(dataNascimento);
      const hoje = new Date();

      let idade = hoje.getFullYear() - nascimento.getFullYear();

      const mes = hoje.getMonth() - nascimento.getMonth();

      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }

      return `${idade} anos`;
    } catch (error) {
      console.log("Erro ao calcular idade:", error);
      return "---";
    }
  };

  useEffect(() => {
    loadDadosUsuario();
  }, []);

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Card Perfil */}
        <View style={styles.profileCard}>
          <Text style={styles.welcomeText}>Bem-vindo,</Text>

          <Text style={styles.nameText}>{user?.nome || "Carregando..."}</Text>
        </View>

        {/* Informações */}
        <View style={styles.infoContainer}>
          {/* Email */}
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />

            <View style={styles.textGroup}>
              <Text style={styles.label}>E-mail</Text>

              <Text style={styles.value}>{user?.email || "---"}</Text>
            </View>
          </View>

          {/* Idade */}
          <View style={styles.infoRow}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.primary}
            />

            <View style={styles.textGroup}>
              <Text style={styles.label}>Idade</Text>

              <Text style={styles.value}>
                {calcularIdade(user?.data_nascimento)}
              </Text>
            </View>
          </View>

          {/* Comorbidades */}
          <View style={styles.infoRow}>
            <Ionicons name="bandage-outline" size={20} color={colors.primary} />

            <View style={styles.textGroup}>
              <Text style={styles.label}>Comorbidades</Text>

              <Text style={styles.value}>{user?.comorbidades || "---"}</Text>
            </View>
          </View>

          {/* Raça */}
          <View style={styles.infoRow}>
            <Ionicons
              name="accessibility-outline"
              size={20}
              color={colors.primary}
            />

            <View style={styles.textGroup}>
              <Text style={styles.label}>Raça</Text>

              <Text style={styles.value}>{user?.raca || "---"}</Text>
            </View>
          </View>

          {/* Gênero */}
          <View style={styles.infoRow}>
            <Ionicons
              name="transgender-outline"
              size={20}
              color={colors.primary}
            />

            <View style={styles.textGroup}>
              <Text style={styles.label}>Gênero</Text>

              <Text style={styles.value}>{user?.genero || "---"}</Text>
            </View>
          </View>

          {/* Telefone */}
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />

            <View style={styles.textGroup}>
              <Text style={styles.label}>Telefone</Text>

              <Text style={styles.value}>{user?.telefone || "---"}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scroll: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },

  profileCard: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 20,
    padding: 24,
    backgroundColor: colors.cardBlue,
    borderRadius: radius.lg,
  },

  welcomeText: {
    fontSize: 16,
    color: colors.textMuted,
  },

  nameText: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 5,
  },

  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: 20,
    elevation: 2,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 15,
  },

  textGroup: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  value: {
    fontSize: 17,
    color: colors.text,
    fontWeight: "500",
  },
});
