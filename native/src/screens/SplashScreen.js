import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { colors } from "../theme";
import Logo from "../components/Logo";

export default function SplashScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => navigation.replace("Login"), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fade, transform: [{ scale }] }}>
        <Logo size="lg" />
      </Animated.View>
      <Animated.Text style={[styles.tagline, { opacity: fade }]}>
        Compromisso com seus{"\n"}medicamentos
      </Animated.Text>
      <Animated.Text style={[styles.loading, { opacity: fade }]}>
        Carregando...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.secondary,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 26,
  },
  loading: {
    position: "absolute",
    bottom: 60,
    fontSize: 16,
    color: colors.secondary,
    fontStyle: "italic",
  },
});
