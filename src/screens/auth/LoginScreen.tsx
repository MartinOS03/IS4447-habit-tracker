import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { FormField } from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { palette } from '../../theme/colors';

type LoginScreenProps = {
  onSwitchToRegister: () => void;
};

export const LoginScreen = ({ onSwitchToRegister }: LoginScreenProps) => {
  const { signIn } = useAuth();
  const { isDark } = useThemeMode();
  const colors = palette[isDark ? 'dark' : 'light'];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Login failed', (error as Error).message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>HabitFlow</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>Track habits and hit your goals.</Text>
      <FormField
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
      />
      <FormField
        label="Password"
        placeholder="Enter password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <Pressable style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.primaryButtonText}>Login</Text>
      </Pressable>
      <Pressable onPress={onSwitchToRegister}>
        <Text style={[styles.link, { color: colors.primary }]}>No account? Register</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: '#475569',
    marginBottom: 20,
  },
  primaryButton: {
    marginTop: 10,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  link: {
    textAlign: 'center',
    marginTop: 14,
    color: '#4338CA',
  },
});
