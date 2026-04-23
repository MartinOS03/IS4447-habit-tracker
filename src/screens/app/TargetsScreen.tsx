import React, { useCallback, useState } from 'react';
import { FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState } from '../../components/EmptyState';
import { useThemeMode } from '../../context/ThemeContext';
import { createTarget, getCategoryList, getTargetProgress } from '../../db/queries';
import { palette } from '../../theme/colors';

type TargetRow = Awaited<ReturnType<typeof getTargetProgress>>[number];
type CategoryRow = Awaited<ReturnType<typeof getCategoryList>>[number];

export const TargetsScreen = () => {
  const { isDark } = useThemeMode();
  const colors = palette[isDark ? 'dark' : 'light'];
  const [rows, setRows] = useState<TargetRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [name, setName] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [targetCount, setTargetCount] = useState('10');
  const [categoryId, setCategoryId] = useState('');

  const refresh = useCallback(async () => {
    const [targetData, categoryData] = await Promise.all([getTargetProgress(), getCategoryList()]);
    setRows(targetData);
    setCategories(categoryData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Targets</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Target name"
        placeholderTextColor={colors.mutedText}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Period: weekly or monthly"
        placeholderTextColor={colors.mutedText}
        value={period}
        onChangeText={(value) => setPeriod(value === 'monthly' ? 'monthly' : 'weekly')}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Target count"
        placeholderTextColor={colors.mutedText}
        value={targetCount}
        keyboardType="number-pad"
        onChangeText={setTargetCount}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.text }]}
        placeholder="Optional category ID"
        placeholderTextColor={colors.mutedText}
        value={categoryId}
        onChangeText={setCategoryId}
        keyboardType="number-pad"
      />
      <Text style={[styles.hint, { color: colors.mutedText }]}>
        Categories: {categories.map((c) => `${c.id}:${c.name}`).join(' | ') || 'None'}
      </Text>
      <Pressable
        style={styles.button}
        onPress={async () => {
          Keyboard.dismiss();
          if (!name.trim()) {
            return;
          }
          await createTarget(name, period, Number(targetCount) || 0, categoryId ? Number(categoryId) : undefined);
          setName('');
          setPeriod('weekly');
          setTargetCount('10');
          setCategoryId('');
          await refresh();
        }}
      >
        <Text style={styles.buttonText}>Add Target</Text>
      </Pressable>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={Keyboard.dismiss}
        ListEmptyComponent={<EmptyState title="No targets yet" subtitle="Define weekly and monthly goals." />}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.meta, { color: colors.mutedText }]}>
              {item.period.toUpperCase()} target: {item.targetCount}
            </Text>
            <Text style={[styles.meta, { color: colors.mutedText }]}>Current: {item.current}</Text>
            <Text style={[styles.meta, { color: colors.mutedText }]}>
              {item.isMet
                ? item.isExceeded
                  ? `Exceeded by ${item.current - item.targetCount}`
                  : 'Target met'
                : `Remaining: ${item.remaining}`}
            </Text>
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
  hint: { color: '#64748B', marginBottom: 8, fontSize: 12 },
  button: {
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 12,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700' },
  listContent: { paddingBottom: 120 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 10,
  },
  name: { fontWeight: '700' },
  meta: { color: '#475569', marginTop: 4 },
});
