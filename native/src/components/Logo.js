import React from "react";
import { Image, StyleSheet } from "react-native";

export default function Logo({ size = "lg" }) {
  const sizes = {
    sm: 120,
    md: 220,
    lg: 750,
  };

  return (
    <Image
      source={require("../assets/logo-Oficial.png")}
      style={[
        styles.logo,
        {
          width: 250,
          height: 90,
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
