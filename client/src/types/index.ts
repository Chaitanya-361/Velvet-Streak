export type HabitType = 'binary' | 'quantitative';
export type HabitCategory = 'Fitness' | 'Creative' | 'Learning' | 'Wellness' | 'Social' | 'Other';
export type ScheduleType = 'daily' | 'specific_days' | 'times_per_week';
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type TodoPriority = 'critical' | 'high' | 'medium' | 'low';
export type TodoView = 'today' | 'upcoming' | 'all' | 'completed';
export type DayState = 'completed' | 'missed' | 'not_scheduled' | 'today_pending' | 'future';

export interface Schedule {
  type: ScheduleType;
  days?: DayOfWeek[];
  timesPerWeek?: number;
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
  sortOrder: number;
  startDate: string;
  currentStreak: number;
  longestStreak: number;
  totalCheckIns: number;
  lastCheckInLogicalDate?: string;
  todayStatus: 'pending' | 'completed' | 'missed' | 'not_scheduled';
  todayProgress?: number;
  weeklyProgress?: number;
}

export interface CheckIn {
  _id: string;
  habitId: string;
  logicalDate: string;
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

export interface ZenSession {
  _id: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  logicalDate: string;
  createdAt: string;
}

export interface ZenWeeklyDay {
  label: string;
  date: string;
  totalSeconds: number;
}
