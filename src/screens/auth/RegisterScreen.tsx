import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { FormField } from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';

type RegisterScreenProps = {
  onSwitchToLogin: () => void;
};

export const RegisterScreen = ({ onSwitchToLogin }: RegisterScreenProps) => {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await signUp(email, password, displayName);
    } catch (error) {
      Alert.alert('Registration failed', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <FormField
        label="Display Name"
        placeholder="Your name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <FormField
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
      />
      <FormField
        label="Password"
        placeholder="Choose password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <Pressable style={styles.primaryButton} onPress={handleRegister}>
        <Text style={styles.primaryButtonText}>Register</Text>
      </Pressable>
      <Pressable onPress={onSwitchToLogin}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
    fontSize: 28,
    fontWeight: '800',
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
