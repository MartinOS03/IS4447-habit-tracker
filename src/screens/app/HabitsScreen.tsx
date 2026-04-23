import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import { createHabit, deleteHabit, getCategoryList, getHabitList } from '../../db/queries';

type HabitRow = Awaited<ReturnType<typeof getHabitList>>[number];
type CategoryRow = Awaited<ReturnType<typeof getCategoryList>>[number];

export const HabitsScreen = () => {
  const [rows, setRows] = useState<HabitRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const refresh = useCallback(async () => {
    const [habitData, categoryData] = await Promise.all([getHabitList(), getCategoryList()]);
    setRows(habitData);
    setCategories(categoryData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Habits</Text>
      <Text style={styles.subheading}>
        Habitflow focus: sleep, low-carb nutrition, push/pull/legs gym, and daily study.
      </Text>
      <TextInput style={styles.input} placeholder="Habit name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Short description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Category ID"
        value={categoryId}
        onChangeText={setCategoryId}
        keyboardType="number-pad"
      />
      <Text style={styles.hint}>
        Categories: {categories.map((c) => `${c.id}:${c.name}`).join(' | ') || 'None'}
      </Text>
      <Pressable
        style={styles.addButton}
        onPress={async () => {
          if (!name.trim() || !categoryId) {
            return;
          }
          await createHabit(name, description, Number(categoryId));
          setName('');
          setDescription('');
          setCategoryId('');
          await refresh();
        }}
      >
        <Text style={styles.addButtonText}>Add Habit</Text>
      </Pressable>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState title="No habits yet" subtitle="Add your first habit to get started." />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.categoryName}</Text>
            {!!item.description && <Text style={styles.cardDescription}>{item.description}</Text>}
            <Pressable
              style={styles.deleteButton}
              onPress={async () => {
                await deleteHabit(item.id);
                await refresh();
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
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
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
