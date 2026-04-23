import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const EmptyState = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
  },
});
