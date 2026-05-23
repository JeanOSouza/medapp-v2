import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import PerfilScreen from "../screens/Perfil";
import HistoricoScreen from "../screens/HistoricoScreen";
import CadastroMedicamentoScreen from "../screens/CadastroMedicamentoScreen";

import { colors } from "../theme";

const Tab = createBottomTabNavigator();

// Botão central
function AddButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.addContainer}>
      <View style={styles.addBtn}>
        <Ionicons name="add" size={32} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      {/* HOME */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* HISTÓRICO */}
      <Tab.Screen
        name="Historico"
        component={HistoricoScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />

      {/* BOTÃO CENTRAL */}
      <Tab.Screen
        name="AddMed"
        component={CadastroMedicamentoScreen}
        options={{
          tabBarButton: (props) => <AddButton {...props} />,
        }}
      />

      {/* PERFIL */}
      <Tab.Screen
        name="PerfilTab"
        component={PerfilScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    height: 70,
    borderTopWidth: 0,

    elevation: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },

    shadowOpacity: 0.1,
    shadowRadius: 5,

    paddingBottom: 10,
  },

  addContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    bottom: 8,
  },

  addBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,

    backgroundColor: colors.secondary,

    justifyContent: "center",
    alignItems: "center",
  },
});
