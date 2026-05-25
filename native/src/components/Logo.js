import React from "react";
import { Image, StyleSheet } from "react-native";

export default function Logo({ size = "lg" }) {
  const sizes = {
    sm: 100,
    md: 100,
    lg: 250,
  };

  return (
    <Image
      source={require("../assets/logo-Oficial.png")}
      style={[
        styles.logo,
        {
          width: 200,
          height: 75,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    resizeMode: "contain",
  },
});
