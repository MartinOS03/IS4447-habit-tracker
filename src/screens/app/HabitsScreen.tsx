import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import { useThemeMode } from '../../context/ThemeContext';
import { createHabit, deleteHabit, getCategoryList, getHabitList } from '../../db/queries';
import { palette } from '../../theme/colors';

type HabitRow = Awaited<ReturnType<typeof getHabitList>>[number];
type CategoryRow = Awaited<ReturnType<typeof getCategoryList>>[number];

export const HabitsScreen = () => {
  const { isDark } = useThemeMode();
  const colors = palette[isDark ? 'dark' : 'light'];
  const [rows, setRows] = useState<HabitRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const refresh = useCallback(async () => {
    const [habitData, categoryData] = await Promise.all([getHabitList(), getCategoryList()]);
    setRows(habitData);
    setCategories(categoryData);
    setCategoryId((current) =>
      current || categoryData.length === 0 ? current : categoryData[0].id.toString(),
    );
  }, []);

  const handleAddHabit = async () => {
    const trimmedName = name.trim();
    const numericCategoryId = Number(categoryId);
    if (!trimmedName) {
      Alert.alert('Missing habit name', 'Please enter a habit name before saving.');
      return;
    }
    if (!numericCategoryId || !categories.some((category) => category.id === numericCategoryId)) {
      Alert.alert('Invalid category', 'Please pick a valid category.');
      return;
    }
    try {
      await createHabit(trimmedName, description, numericCategoryId);
      setName('');
      setDescription('');
      await refresh();
      Alert.alert('Saved', 'Habit added successfully.');
    } catch (error) {
      Alert.alert('Save failed', (error as Error).message);
    }
  };

  const handleDeleteHabit = async (habitId: number) => {
    try {
      await deleteHabit(habitId);
      await refresh();
      Alert.alert('Deleted', 'Habit removed successfully.');
    } catch (error) {
      Alert.alert('Delete failed', (error as Error).message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Habits</Text>
      <Text style={[styles.subheading, { color: colors.mutedText }]}>
        Habitflow focus: sleep, low-carb nutrition, push/pull/legs gym, and daily study.
      </Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Habit name"
        placeholderTextColor={colors.mutedText}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Short description"
        placeholderTextColor={colors.mutedText}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Category ID"
        placeholderTextColor={colors.mutedText}
        value={categoryId}
        onChangeText={setCategoryId}
        keyboardType="number-pad"
      />
      <Text style={[styles.hint, { color: colors.mutedText }]}>
        Categories: {categories.map((c) => `${c.id}:${c.name}`).join(' | ') || 'None'}
      </Text>
      <Pressable
        style={styles.addButton}
        onPress={handleAddHabit}
      >
        <Text style={styles.addButtonText}>Add Habit</Text>
      </Pressable>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState title="No habits yet" subtitle="Add your first habit to get started." />
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.categoryName}</Text>
            {!!item.description && (
              <Text style={[styles.cardDescription, { color: colors.mutedText }]}>{item.description}</Text>
            )}
            <Pressable
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert('Delete habit', `Delete "${item.name}"?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => void handleDeleteHabit(item.id) },
                ]);
              }}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 28, fontWeight: '800' },
  subheading: { marginBottom: 12, color: '#475569' },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  hint: { color: '#64748B', marginBottom: 8, fontSize: 12 },
  addButton: {
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 12,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '700' },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardMeta: { color: '#4F46E5', marginTop: 2 },
  cardDescription: { color: '#475569', marginTop: 4 },
  listContent: { paddingBottom: 120 },
  deleteButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deleteButtonText: { color: '#B91C1C', fontWeight: '700' },
});
