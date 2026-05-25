import React from "react";
import { View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme";
import Logo from "./Logo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function Header() {
  const navigation = useNavigation();

  async function handleLogout() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.log("Erro logout:", error);
      Alert.alert("Erro", "Não foi possível sair.");
    }
  }

  return (
    <View style={styles.container}>
      <View />

      <Logo size="lg" />

      <View style={styles.right}>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={25} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    marginLeft: 20,
    paddingTop: 25,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
