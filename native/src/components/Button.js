import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius } from '../theme';

export default function Button({ title, onPress, loading = false, style }) {
  return (
    <TouchableOpacity style={[styles.btn, style]} onPress={onPress} activeOpacity={0.85}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { height: 52, borderRadius: radius.full, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
