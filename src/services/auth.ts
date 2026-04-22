import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';

const SESSION_KEY = 'habit_tracker_session_email';

export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, normalizedEmail));
  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  await db.insert(users).values({
    email: normalizedEmail,
    displayName: displayName.trim(),
    passwordHash: password,
    createdAt: new Date().toISOString(),
  });
};

export const loginUser = async (email: string, password: string): Promise<void> => {
  const normalizedEmail = email.trim().toLowerCase();
  const result = await db.select().from(users).where(eq(users.email, normalizedEmail));
  const user = result[0];
  if (!user || user.passwordHash !== password) {
    throw new Error('Invalid email or password');
  }
  await AsyncStorage.setItem(SESSION_KEY, normalizedEmail);
};

export const logoutUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

export const getCurrentSessionEmail = async (): Promise<string | null> => {
  return AsyncStorage.getItem(SESSION_KEY);
};
