import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

// Importações das Telas
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import CadastroScreen from "../screens/CadastroScreen";
import Cadastro2Screen from "../screens/Cadastro2Screen";
import HomeScreen from "../screens/HomeScreen";
import HistoricoScreen from "../screens/HistoricoScreen";
import CadastroMedicamentoScreen from "../screens/CadastroMedicamentoScreen";
import PerfilScreen from "../screens/Perfil";
import HistoricoMedicamentoScreen from "../screens/DescricaoRemedio";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AddButton({ onPress }) {
  return (
    <View style={styles.addContainer}>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// --- NAVEGAÇÃO POR TABS ---
function MainTabs() {
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
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Historico"
        component={HistoricoScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddMed"
        component={CadastroMedicamentoScreen}
        options={{
          tabBarButton: (props) => <AddButton {...props} />,
        }}
      />
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

// --- NAVEGADOR PRINCIPAL ---
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Cadastro2" component={Cadastro2Screen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen
          name="DescricaoRemedio"
          component={HistoricoMedicamentoScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    height: 70,
    borderTopWidth: 0,
    elevation: 10, // Sombra Android
    shadowColor: "#000", // Sombra iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    paddingBottom: 10,
  },
  addContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // O pulo do gato está aqui:
    bottom: 8, // Eleva o container inteiro
  },
  addBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary, // Certifique-se que colors.secondary é o seu verde
    justifyContent: "center",
    alignItems: "center",
  },
});
