import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { deleteProfileData } from '../../db/seed';
import { palette } from '../../theme/colors';

export const SettingsScreen = () => {
  const { sessionEmail, signOut } = useAuth();
  const { mode, toggleTheme, isDark } = useThemeMode();
  const colors = palette[isDark ? 'dark' : 'light'];

  const handleDeleteProfile = async () => {
    if (!sessionEmail) {
      return;
    }

    try {
      await deleteProfileData(sessionEmail);
      await signOut();
    } catch (error) {
      Alert.alert('Delete failed', (error as Error).message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Settings</Text>
      <Text style={[styles.meta, { color: colors.mutedText }]}>Signed in as: {sessionEmail ?? 'none'}</Text>

      <Pressable style={[styles.button, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={toggleTheme}>
        <Text style={[styles.buttonText, { color: colors.text }]}>Toggle Theme (Current: {mode})</Text>
      </Pressable>

      <Pressable style={[styles.button, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={signOut}>
        <Text style={[styles.buttonText, { color: colors.text }]}>Logout</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.danger]} onPress={handleDeleteProfile}>
        <Text style={[styles.buttonText, styles.dangerText]}>Delete Profile</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 16 },
  heading: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  meta: { color: '#475569', marginBottom: 20 },
  button: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  buttonText: { fontWeight: '700' },
  danger: { borderColor: '#FCA5A5' },
  dangerText: { color: '#B91C1C' },
});
