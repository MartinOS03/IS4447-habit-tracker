import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const expoDb = openDatabaseSync('habit-tracker.db');

export const db = drizzle(expoDb);

export const initializeDatabase = async (): Promise<void> => {
  await expoDb.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS targets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      period TEXT NOT NULL CHECK(period IN ('weekly', 'monthly')),
      target_count INTEGER NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Lightweight migration for existing local DBs created before category_id.
  try {
    await expoDb.execAsync(`
      ALTER TABLE habit_logs ADD COLUMN category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;
    `);
  } catch {
    // Column already exists.
  }
};
