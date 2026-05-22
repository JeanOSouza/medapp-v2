import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme";
import Logo from "./Logo";

export default function Header() {
  return (
    <View style={styles.container}>
      <View></View>

      <Logo size="md" />
      <View style={styles.right}>
        <TouchableOpacity></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    paddingTop: 25,
  },
  right: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
});
