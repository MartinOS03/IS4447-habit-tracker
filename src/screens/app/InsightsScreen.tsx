import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { EmptyState } from '../../components/EmptyState';
import { getDailyLogTotals } from '../../db/queries';

type DailyTotalRow = Awaited<ReturnType<typeof getDailyLogTotals>>[number];

export const InsightsScreen = () => {
  const [rows, setRows] = useState<DailyTotalRow[]>([]);
  const [range, setRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const data = await getDailyLogTotals();
        setRows(data.reverse());
      };
      void load();
    }, []),
  );

  const chartRows = useMemo(() => {
    if (range === 'daily') {
      return rows.map((row) => ({ label: row.date.slice(5), value: Number(row.total ?? 0) }));
    }
    const map = new Map<string, number>();
    rows.forEach((row) => {
      const date = new Date(row.date);
      const key =
        range === 'weekly'
          ? `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
          : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) ?? 0) + Number(row.total ?? 0));
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [range, rows]);

  const chartData = useMemo(
    () => ({
      labels: chartRows.map((row) => row.label),
      datasets: [{ data: chartRows.map((row) => row.value) }],
    }),
    [chartRows],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Insights</Text>
      <Text style={styles.subtitle}>Daily completion trend from stored habit logs.</Text>
      <View style={styles.toggleRow}>
        {(['daily', 'weekly', 'monthly'] as const).map((value) => (
          <Pressable
            key={value}
            style={[styles.toggle, range === value && styles.toggleActive]}
            onPress={() => setRange(value)}
          >
            <Text style={[styles.toggleText, range === value && styles.toggleTextActive]}>{value}</Text>
          </Pressable>
        ))}
      </View>
      {rows.length === 0 ? (
        <EmptyState title="No logs yet" subtitle="Start logging habits to see charts." />
      ) : (
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={240}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
          chartConfig={{
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#FFFFFF',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
            labelColor: () => '#334155',
          }}
          style={styles.chart}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16 },
  heading: { fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#475569', marginBottom: 12 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toggle: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  toggleActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  toggleText: { fontWeight: '600', color: '#1E293B' },
  toggleTextActive: { color: '#FFFFFF' },
  chart: { borderRadius: 12 },
});
