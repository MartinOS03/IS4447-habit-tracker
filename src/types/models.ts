export type GoalPeriod = 'weekly' | 'monthly';

export interface UserProfile {
  id: number;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Habit {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  createdAt: string;
}

export interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  count: number;
  notes?: string;
  createdAt: string;
}

export interface Target {
  id: number;
  name: string;
  period: GoalPeriod;
  targetCount: number;
  categoryId?: number;
  createdAt: string;
}
