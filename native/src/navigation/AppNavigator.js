import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import CadastroScreen from "../screens/CadastroScreen";
import Cadastro2Screen from "../screens/Cadastro2Screen";
import PerfilScreen from "../screens/Perfil";
import HistoricoMedicamentoScreen from "../screens/DescricaoRemedio";

import MainTabs from "./MainTabs";

const Stack = createNativeStackNavigator();

// --- NAVEGADOR PRINCIPAL ---
export default function AppNavigator() {
  const [loading, setLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    verificarLogin();
  }, []);

  const verificarLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        setIsLogged(true);
      }
    } catch (error) {
      console.log("Erro ao verificar login:", error);
    } finally {
      setLoading(false);
    }
  };

  // Enquanto verifica login
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLogged ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Perfil" component={PerfilScreen} />

            <Stack.Screen
              name="DescricaoRemedio"
              component={HistoricoMedicamentoScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
            <Stack.Screen name="Cadastro2" component={Cadastro2Screen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
