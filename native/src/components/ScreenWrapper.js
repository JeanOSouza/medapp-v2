// components/ScreenWrapper.js
import React, { useState, useCallback } from "react";
import { ScrollView, RefreshControl, StyleSheet } from "react-native";

export default function ScreenWrapper({ children, onRefreshAction }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (onRefreshAction) {
      await onRefreshAction(); // Executa a função de busca que você passar
    }
    setRefreshing(false);
  }, [onRefreshAction]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#2196F3" // Cor do carregamento
        />
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1, // Garante que o scroll cubra a tela toda mesmo se tiver pouco conteúdo
  },
});
