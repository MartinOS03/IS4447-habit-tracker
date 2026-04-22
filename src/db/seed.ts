import { eq } from 'drizzle-orm';
import { db } from './client';
import { categories, habits, habitLogs, targets, users } from './schema';

const isoNow = () => new Date().toISOString();

export const seedDatabase = async (): Promise<void> => {
  const demoEmail = 'student@local.dev';
  const existingDemoUser = await db.select().from(users);
  if (existingDemoUser.length === 0) {
    await db.insert(users).values({
      email: demoEmail,
      displayName: 'Student User',
      passwordHash: 'demo-password',
      createdAt: isoNow(),
    });
  }

  const categorySeed = [
    { name: 'Sleep', color: '#6366F1', icon: 'moon' },
    { name: 'Nutrition', color: '#16A34A', icon: 'leaf' },
    { name: 'Gym', color: '#DC2626', icon: 'dumbbell' },
    { name: 'Study', color: '#2563EB', icon: 'book' },
  ];
  const existingCategories = await db.select().from(categories);
  const missingCategories = categorySeed
    .filter((item) => !existingCategories.some((cat) => cat.name === item.name))
    .map((item) => ({ ...item, createdAt: isoNow() }));
  if (missingCategories.length > 0) {
    await db.insert(categories).values(missingCategories);
  }

  const allCategories = await db.select().from(categories);
  const sleepCategory = allCategories.find((cat) => cat.name === 'Sleep');
  const nutritionCategory = allCategories.find((cat) => cat.name === 'Nutrition');
  const gymCategory = allCategories.find((cat) => cat.name === 'Gym');
  const studyCategory = allCategories.find((cat) => cat.name === 'Study');
  if (!sleepCategory || !nutritionCategory || !gymCategory || !studyCategory) {
    throw new Error('Seed failed: categories were not created.');
  }

  const habitSeed = [
    {
      name: 'Sleep Tracking',
      description: 'Try to hit 8 hours of sleep each night.',
      categoryId: sleepCategory.id,
    },
    {
      name: 'Diet Tracking',
      description: 'Follow low-carb, high-protein meals each day.',
      categoryId: nutritionCategory.id,
    },
    {
      name: 'Gym Tracking',
      description: 'Push / Pull / Legs split through the week.',
      categoryId: gymCategory.id,
    },
    {
      name: 'Study Tracking',
      description: 'Study at least 3 hours each day.',
      categoryId: studyCategory.id,
    },
  ];
  const existingHabits = await db.select().from(habits);
  const missingHabits = habitSeed
    .filter((item) => !existingHabits.some((habit) => habit.name === item.name))
    .map((item) => ({ ...item, createdAt: isoNow() }));
  if (missingHabits.length > 0) {
    await db.insert(habits).values(missingHabits);
  }

  const allHabits = await db.select().from(habits);
  const sleepHabit = allHabits.find((habit) => habit.name === 'Sleep Tracking');
  const dietHabit = allHabits.find((habit) => habit.name === 'Diet Tracking');
  const gymHabit = allHabits.find((habit) => habit.name === 'Gym Tracking');
  const studyHabit = allHabits.find((habit) => habit.name === 'Study Tracking');
  if (!sleepHabit || !dietHabit || !gymHabit || !studyHabit) {
    throw new Error('Seed failed: habits were not created.');
  }

  const today = new Date();
  const toDate = (offset: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    return date.toISOString().slice(0, 10);
  };

  const habitLogSeed = [
    {
      habit: sleepHabit,
      rows: [
        { offset: 0, count: 8, notes: '8 hours sleep target reached' },
        { offset: 1, count: 7, notes: 'Slept slightly under target' },
        { offset: 2, count: 8, notes: 'Consistent bedtime' },
      ],
    },
    {
      habit: dietHabit,
      rows: [
        { offset: 0, count: 1, notes: 'Low-carb high-protein plan followed' },
        { offset: 1, count: 1, notes: 'Good protein intake all day' },
        { offset: 2, count: 0, notes: 'Too many carbs at dinner' },
      ],
    },
    {
      habit: gymHabit,
      rows: [
        { offset: 0, count: 1, notes: 'Push day completed' },
        { offset: 1, count: 1, notes: 'Pull day completed' },
        { offset: 2, count: 1, notes: 'Leg day completed' },
      ],
    },
    {
      habit: studyHabit,
      rows: [
        { offset: 0, count: 3, notes: '3 hours revision done' },
        { offset: 1, count: 2, notes: 'Studied 2 hours today' },
        { offset: 2, count: 4, notes: 'Good deep work session' },
      ],
    },
  ];

  const existingLogs = await db.select().from(habitLogs);
  for (const item of habitLogSeed) {
    const hasLogs = existingLogs.some((row) => row.habitId === item.habit.id);
    if (hasLogs) {
      continue;
    }
    await db.insert(habitLogs).values(
      item.rows.map((row) => ({
        habitId: item.habit.id,
        categoryId: item.habit.categoryId,
        date: toDate(row.offset),
        count: row.count,
        notes: row.notes,
        createdAt: isoNow(),
      })),
    );
  }

  const targetSeed = [
    { name: 'Weekly Sleep Goal (8h avg)', period: 'weekly' as const, targetCount: 56, categoryId: sleepCategory.id },
    { name: 'Weekly Diet Consistency', period: 'weekly' as const, targetCount: 7, categoryId: nutritionCategory.id },
    { name: 'Weekly Gym Sessions', period: 'weekly' as const, targetCount: 6, categoryId: gymCategory.id },
    { name: 'Weekly Study Goal (3h/day)', period: 'weekly' as const, targetCount: 21, categoryId: studyCategory.id },
  ];
  const existingTargets = await db.select().from(targets);
  const missingTargets = targetSeed
    .filter((item) => !existingTargets.some((target) => target.name === item.name))
    .map((item) => ({ ...item, createdAt: isoNow() }));
  if (missingTargets.length > 0) {
    await db.insert(targets).values(missingTargets);
  }
};

export const deleteProfileData = async (email: string): Promise<void> => {
  await db.delete(users).where(eq(users.email, email));
};
