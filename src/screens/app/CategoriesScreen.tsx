import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import { useThemeMode } from '../../context/ThemeContext';
import { createCategory, getCategoryList, updateCategory } from '../../db/queries';
import { palette } from '../../theme/colors';

type CategoryRow = Awaited<ReturnType<typeof getCategoryList>>[number];

export const CategoriesScreen = () => {
  const { isDark } = useThemeMode();
  const colors = palette[isDark ? 'dark' : 'light'];
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4F46E5');
  const [icon, setIcon] = useState('tag');

  const refresh = useCallback(async () => {
    setRows(await getCategoryList());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Categories</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Category name"
        placeholderTextColor={colors.mutedText}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Color hex"
        placeholderTextColor={colors.mutedText}
        value={color}
        onChangeText={setColor}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Icon name"
        placeholderTextColor={colors.mutedText}
        value={icon}
        onChangeText={setIcon}
      />
      <Pressable
        style={styles.button}
        onPress={async () => {
          if (!name.trim()) {
            return;
          }
          if (editingId) {
            await updateCategory(editingId, name, color, icon);
          } else {
            await createCategory(name, color, icon);
          }
          setEditingId(null);
          setName('');
          setColor('#4F46E5');
          setIcon('tag');
          await refresh();
        }}
      >
        <Text style={styles.buttonText}>{editingId ? 'Update Category' : 'Add Category'}</Text>
      </Pressable>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<EmptyState title="No categories" subtitle="Create your first category." />}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.icon, { color: colors.mutedText }]}>{item.icon}</Text>
            <Pressable
              onPress={() => {
                setEditingId(item.id);
                setName(item.name);
                setColor(item.color);
                setIcon(item.icon);
              }}
            >
              <Text style={styles.edit}>Edit</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  heading: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  button: {
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 12,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  row: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: { width: 12, height: 12, borderRadius: 999, marginRight: 10 },
  name: { flex: 1, fontWeight: '600' },
  icon: { color: '#64748B' },
  edit: { color: '#4F46E5', fontWeight: '700' },
});
