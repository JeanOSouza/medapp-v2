import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

export default function Input({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType }) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry && !show}
          keyboardType={keyboardType}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShow(!show)}>
            <Ionicons name={show ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '500', color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 48, elevation: 1 },
  input: { flex: 1, fontSize: 14, color: colors.text },
});
