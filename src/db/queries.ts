import { and, desc, eq, gte, like, lte, sql } from 'drizzle-orm';
import { db } from './client';
import { categories, habitLogs, habits, targets } from './schema';

export const getHabitList = async () => {
  return db
    .select({
      id: habits.id,
      name: habits.name,
      description: habits.description,
      categoryName: categories.name,
      categoryColor: categories.color,
    })
    .from(habits)
    .innerJoin(categories, eq(habits.categoryId, categories.id))
    .orderBy(desc(habits.id));
};

export const getCategoryList = async () => db.select().from(categories).orderBy(desc(categories.id));

export const getTargetList = async () => db.select().from(targets).orderBy(desc(targets.id));

export const createCategory = async (name: string, color: string, icon: string) => {
  await db.insert(categories).values({
    name: name.trim(),
    color: color.trim() || '#4F46E5',
    icon: icon.trim() || 'tag',
    createdAt: new Date().toISOString(),
  });
};

export const updateCategory = async (id: number, name: string, color: string, icon: string) => {
  await db
    .update(categories)
    .set({ name: name.trim(), color: color.trim(), icon: icon.trim() })
    .where(eq(categories.id, id));
};

export const createHabit = async (name: string, description: string, categoryId: number) => {
  await db.insert(habits).values({
    name: name.trim(),
    description: description.trim(),
    categoryId,
    createdAt: new Date().toISOString(),
  });
};

export const deleteHabit = async (id: number) => {
  await db.delete(habits).where(eq(habits.id, id));
};

export const createTarget = async (
  name: string,
  period: 'weekly' | 'monthly',
  targetCount: number,
  categoryId?: number,
) => {
  await db.insert(targets).values({
    name: name.trim(),
    period,
    targetCount,
    categoryId,
    createdAt: new Date().toISOString(),
  });
};

export const createHabitLog = async (payload: {
  habitId: number;
  date: string;
  count: number;
  categoryId: number;
  notes: string;
}) => {
  await db.insert(habitLogs).values({
    habitId: payload.habitId,
    date: payload.date,
    count: payload.count,
    categoryId: payload.categoryId,
    notes: payload.notes.trim(),
    createdAt: new Date().toISOString(),
  });
};

export const updateHabitLog = async (
  id: number,
  payload: { date: string; count: number; categoryId: number; notes: string },
) => {
  await db
    .update(habitLogs)
    .set({
      date: payload.date,
      count: payload.count,
      categoryId: payload.categoryId,
      notes: payload.notes.trim(),
    })
    .where(eq(habitLogs.id, id));
};

export const deleteHabitLog = async (id: number) => {
  await db.delete(habitLogs).where(eq(habitLogs.id, id));
};

export const getHabitLogList = async (filters?: {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  text?: string;
}) => {
  const conditions = [];
  if (filters?.categoryId) {
    conditions.push(eq(habitLogs.categoryId, filters.categoryId));
  }
  if (filters?.startDate) {
    conditions.push(gte(habitLogs.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(habitLogs.date, filters.endDate));
  }
  if (filters?.text) {
    conditions.push(like(habitLogs.notes, `%${filters.text}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const query = db
    .select({
      id: habitLogs.id,
      habitId: habits.id,
      habitName: habits.name,
      date: habitLogs.date,
      count: habitLogs.count,
      notes: habitLogs.notes,
      categoryId: categories.id,
      categoryName: categories.name,
    })
    .from(habitLogs)
    .innerJoin(habits, eq(habitLogs.habitId, habits.id))
    .innerJoin(categories, eq(habitLogs.categoryId, categories.id))
    .orderBy(desc(habitLogs.date), desc(habitLogs.id));

  if (!whereClause) {
    return query;
  }

  return query.where(whereClause);
};

export const getDailyLogTotals = async () => {
  return db
    .select({
      date: habitLogs.date,
      total: sql<number>`sum(${habitLogs.count})`,
    })
    .from(habitLogs)
    .groupBy(habitLogs.date)
    .orderBy(desc(habitLogs.date));
};

export const getTargetProgress = async () => {
  const [allTargets, allLogs] = await Promise.all([getTargetList(), db.select().from(habitLogs)]);

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(now.getDate() - 30);

  return allTargets.map((target) => {
    const periodStart = target.period === 'weekly' ? weekAgo : monthAgo;
    const logsInPeriod = allLogs.filter((log) => {
      const isWithin = new Date(log.date) >= periodStart;
      const categoryMatch = !target.categoryId || log.categoryId === target.categoryId;
      return isWithin && categoryMatch;
    });
    const total = logsInPeriod.reduce((sum, log) => sum + log.count, 0);
    return {
      ...target,
      current: total,
      remaining: Math.max(0, target.targetCount - total),
      isExceeded: total > target.targetCount,
      isMet: total >= target.targetCount,
    };
  });
};
