import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  createdAt: text('created_at').notNull(),
});

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  createdAt: text('created_at').notNull(),
});

export const habitLogs = sqliteTable('habit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habit_id')
    .notNull()
    .references(() => habits.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  count: integer('count').notNull().default(1),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  period: text('period', { enum: ['weekly', 'monthly'] }).notNull(),
  targetCount: integer('target_count').notNull(),
  categoryId: integer('category_id').references(() => categories.id, {
    onDelete: 'set null',
  }),
  createdAt: text('created_at').notNull(),
});
