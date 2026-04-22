import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider, useThemeMode } from '../context/ThemeContext';
import { CategoriesScreen } from '../screens/app/CategoriesScreen';
import { HabitsScreen } from '../screens/app/HabitsScreen';
import { InsightsScreen } from '../screens/app/InsightsScreen';
import { SettingsScreen } from '../screens/app/SettingsScreen';
import { TargetsScreen } from '../screens/app/TargetsScreen';
import { RecordsScreen } from '../screens/app/RecordsScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { initializeDatabase } from '../db/client';
import { seedDatabase } from '../db/seed';
import { palette } from '../theme/colors';

const Tab = createBottomTabNavigator();

const AuthGate = () => {
  const { isLoading, sessionEmail } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!sessionEmail) {
    return showRegister ? (
      <RegisterScreen onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginScreen onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Records" component={RecordsScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Targets" component={TargetsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const [isReady, setIsReady] = useState(false);
  const { isDark } = useThemeMode();

  useEffect(() => {
    const setup = async () => {
      await initializeDatabase();
      await seedDatabase();
      setIsReady(true);
    };
    void setup();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.loader, { backgroundColor: palette[isDark ? 'dark' : 'light'].background }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AuthGate />
    </NavigationContainer>
  );
};

export const AppNavigator = () => (
  <ThemeProvider>
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  </ThemeProvider>
);

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
