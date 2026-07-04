export type HabitType = 'binary' | 'quantitative';
export type HabitCategory = 'Fitness' | 'Creative' | 'Learning' | 'Wellness' | 'Social' | 'Other';
export type ScheduleType = 'daily' | 'specific_days' | 'times_per_week' | 'interval' | 'times_per_day' | 'times_per_month';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type TodoPriority = 'critical' | 'high' | 'medium' | 'low';
export type TodoView = 'today' | 'upcoming' | 'all' | 'completed';
export type DayState = 'completed' | 'missed' | 'not_scheduled' | 'rest_day' | 'today_pending' | 'future';

export interface Schedule {
  type: ScheduleType;
  days?: DayOfWeek[];
  timesPerDay: number;
  timeWindows?: { label: string; windowStart: string; windowEnd: string }[];
  intervalDays?: number;
  timesPerWeek?: number;
  timesPerMonth?: number;
}

export interface RestDayConfig {
  allowed: boolean;
  maxPerWeek: number | null;
}

export interface Habit {
  _id: string;
  name: string;
  icon: string;
  color: string;
  category: HabitCategory;
  description: string;
  habitType: HabitType;
  quantitative?: {
    targetUnit: string;
    weeklyTarget: number;
  };
  schedule: Schedule;
  restDayConfig: RestDayConfig;
  sortOrder: number;
  startDate: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  lastCheckInLogicalDate?: string;
  todayStatus: 'pending' | 'completed' | 'missed' | 'rest_day' | 'not_scheduled';
  todayProgress?: number; // for quantitative: amount logged today
  weeklyProgress?: number; // for quantitative: total this week
}

export interface CheckIn {
  _id: string;
  habitId: string;
  logicalDate: string;
  slotIndex: number;
  amount?: number;
  note?: string;
  xpAwarded: number;
  createdAt: string;
}

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  deadline: string;
  priority: TodoPriority;
  category?: string;
  subtasks: { id: string; title: string; isCompleted: boolean }[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface Badge {
  key: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: string;
  earned: boolean;
  earnedAt?: string;
}

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  xp: number;
  level: number;
  preferences: {
    timezone: string;
    dayBoundaryTime: string;
    weekStartDay: 'MON' | 'SUN';
  };
  createdAt: string;
}

export interface WeeklyStats {
  weekLabel: string;
  consistencyScore: number;
  prevScore: number;
  totalCheckIns: number;
  perfectHabits: number;
  totalXP: number;
  perHabit: {
    habitId: string;
    name: string;
    icon: string;
    color: string;
    completionRate: number;
    checkInsDone: number;
    checkInsExpected: number;
  }[];
}

export interface HeatmapDay {
  date: string;
  count: number;
}
