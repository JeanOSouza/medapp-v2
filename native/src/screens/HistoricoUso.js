import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme";
import Header from "../components/Header";

export default function HistoricoUso() {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Medicamentos Tomados</Text>
        <View style={styles.card}>
          <View style={styles.img}>
            <Ionicons name="medical" size={28} color={colors.primary} />
          </View>
          <View style={styles.info}></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  scroll: { flex: 1, paddingHorizontal: spacing.md },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.secondary,
    fontStyle: "italic",
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.cardBlue,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  img: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1 },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  uso: { fontSize: 12, color: colors.textLight, fontWeight: "600" },
  desc: { fontSize: 12, color: colors.text },
  date: { fontSize: 12, color: colors.text, marginTop: 2 },
});
