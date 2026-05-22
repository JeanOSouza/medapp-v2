import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

export default function Select({ label, value, options = [], onSelect, placeholder = 'Selecione' }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.select} onPress={() => setOpen(true)}>
        <Text style={[styles.text, !selected && styles.placeholder]}>{selected ? selected.label : placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setOpen(false)} />
        <View style={styles.dropdown}>
          <FlatList data={options} keyExtractor={i => i.value} renderItem={({ item }) => (
            <TouchableOpacity style={styles.option} onPress={() => { onSelect(item.value); setOpen(false); }}>
              <Text style={styles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          )} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '500', color: colors.text, marginBottom: spacing.xs },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.inputBg, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 48, elevation: 1 },
  text: { fontSize: 14, color: colors.text },
  placeholder: { color: colors.textMuted },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  dropdown: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.md, maxHeight: 300 },
  option: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionText: { fontSize: 15, color: colors.text },
});
