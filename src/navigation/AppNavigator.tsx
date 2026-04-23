import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
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
  const { isDark } = useThemeMode();
  const colors = palette[isDark ? 'dark' : 'light'];
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
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Habitflow',
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.text },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { paddingBottom: 6, height: 64, backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
      }}
    >
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

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: palette.dark.background,
          card: palette.dark.card,
          text: palette.dark.text,
          border: palette.dark.border,
          primary: palette.dark.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: palette.light.background,
          card: palette.light.card,
          text: palette.light.text,
          border: palette.light.border,
          primary: palette.light.primary,
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
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
