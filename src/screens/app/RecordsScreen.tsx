import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import {
  createHabitLog,
  deleteHabitLog,
  getCategoryList,
  getHabitList,
  getHabitLogList,
  updateHabitLog,
} from '../../db/queries';

type LogRow = Awaited<ReturnType<typeof getHabitLogList>>[number];
type HabitRow = Awaited<ReturnType<typeof getHabitList>>[number];
type CategoryRow = Awaited<ReturnType<typeof getCategoryList>>[number];

const todayString = () => new Date().toISOString().slice(0, 10);

export const RecordsScreen = () => {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [habits, setHabits] = useState<HabitRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [habitId, setHabitId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayString());
  const [count, setCount] = useState('1');
  const [notes, setNotes] = useState('');

  const [filterText, setFilterText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('');

  const refresh = useCallback(async () => {
    const [habitData, categoryData, logData] = await Promise.all([
      getHabitList(),
      getCategoryList(),
      getHabitLogList({
        text: filterText.trim() || undefined,
        startDate: startDate.trim() || undefined,
        endDate: endDate.trim() || undefined,
        categoryId: filterCategoryId ? Number(filterCategoryId) : undefined,
      }),
    ]);
    setHabits(habitData);
    setCategories(categoryData);
    setLogs(logData);
  }, [endDate, filterCategoryId, filterText, startDate]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const categoryHint = useMemo(
    () => categories.map((c) => `${c.id}:${c.name}`).join(' | '),
    [categories],
  );
  const habitHint = useMemo(() => habits.map((h) => `${h.id}:${h.name}`).join(' | '), [habits]);

  const resetForm = () => {
    setEditingId(null);
    setHabitId('');
    setCategoryId('');
    setDate(todayString());
    setCount('1');
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!habitId || !categoryId || !date) {
      Alert.alert('Missing fields', 'Habit, category and date are required.');
      return;
    }

    const payload = {
      habitId: Number(habitId),
      categoryId: Number(categoryId),
      date,
      count: Number(count) || 0,
      notes,
    };

    if (editingId) {
      await updateHabitLog(editingId, {
        date: payload.date,
        count: payload.count,
        categoryId: payload.categoryId,
        notes: payload.notes,
      });
    } else {
      await createHabitLog(payload);
    }
    resetForm();
    await refresh();
  };

  return (
    <FlatList
      style={styles.container}
      data={logs}
      keyExtractor={(item) => item.id.toString()}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={
        <View>
          <Text style={styles.heading}>Records (Habit Logs)</Text>
          <TextInput
            style={styles.input}
            placeholder="Habit ID"
            value={habitId}
            onChangeText={setHabitId}
            keyboardType="number-pad"
          />
          <Text style={styles.hint}>Habits: {habitHint || 'Create habits first'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Category ID"
            value={categoryId}
            onChangeText={setCategoryId}
            keyboardType="number-pad"
          />
          <Text style={styles.hint}>Categories: {categoryHint || 'Create categories first'}</Text>
          <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
          <TextInput
            style={styles.input}
            placeholder="Count"
            value={count}
            onChangeText={setCount}
            keyboardType="number-pad"
          />
          <TextInput style={styles.input} placeholder="Notes" value={notes} onChangeText={setNotes} />
          <Pressable style={styles.primaryButton} onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>{editingId ? 'Update Record' : 'Add Record'}</Text>
          </Pressable>

          <Text style={styles.section}>Search & Filter</Text>
          <TextInput
            style={styles.input}
            placeholder="Text in notes"
            value={filterText}
            onChangeText={setFilterText}
          />
          <TextInput
            style={styles.input}
            placeholder="Start date YYYY-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
          />
          <TextInput
            style={styles.input}
            placeholder="End date YYYY-MM-DD"
            value={endDate}
            onChangeText={setEndDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Filter category ID"
            value={filterCategoryId}
            onChangeText={setFilterCategoryId}
            keyboardType="number-pad"
          />
          <Pressable style={styles.secondaryButton} onPress={refresh}>
            <Text style={styles.secondaryButtonText}>Apply Filters</Text>
          </Pressable>
        </View>
      }
      ListEmptyComponent={<EmptyState title="No records found" subtitle="Add a log or adjust filters." />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.habitName}</Text>
          <Text style={styles.cardMeta}>
            {item.date} | Count: {item.count} | {item.categoryName}
          </Text>
          {!!item.notes && <Text style={styles.cardNotes}>{item.notes}</Text>}
          <View style={styles.row}>
            <Pressable
              style={styles.smallButton}
              onPress={() => {
                setEditingId(item.id);
                setHabitId(item.habitId.toString());
                setCategoryId(item.categoryId.toString());
                setDate(item.date);
                setCount(item.count.toString());
                setNotes(item.notes ?? '');
              }}
            >
              <Text style={styles.smallButtonText}>Edit</Text>
            </Pressable>
            <Pressable
              style={[styles.smallButton, styles.dangerButton]}
              onPress={async () => {
                await deleteHabitLog(item.id);
                await refresh();
              }}
            >
              <Text style={[styles.smallButtonText, styles.dangerText]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { padding: 12, paddingBottom: 120 },
  heading: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
  section: { marginTop: 12, marginBottom: 8, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  hint: { color: '#64748B', fontSize: 12, marginBottom: 8 },
  primaryButton: {
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    paddingVertical: 11,
    marginBottom: 6,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700' },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    paddingVertical: 11,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: { fontWeight: '700' },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
  },
  cardTitle: { fontWeight: '700' },
  cardMeta: { color: '#475569', marginTop: 3 },
  cardNotes: { marginTop: 4 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  smallButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallButtonText: { fontWeight: '700' },
  dangerButton: { borderColor: '#FCA5A5' },
  dangerText: { color: '#B91C1C' },
});
