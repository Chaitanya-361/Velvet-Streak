import type { Habit, Todo, Badge, UserProfile, WeeklyStats, HeatmapDay, CheckIn } from '../types';

export const mockUser: UserProfile = {
  _id: 'user1',
  username: 'akki_dev',
  email: 'akki@example.com',
  displayName: 'Akki',
  bio: 'Building habits, one streak at a time 🦚',
  xp: 2340,
  level: 5,
  preferences: {
    timezone: 'Asia/Kolkata',
    dayBoundaryTime: '03:00',
    weekStartDay: 'MON',
    theme: 'dark',
  },
  createdAt: '2026-03-01T00:00:00Z',
};

export const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000, 7000, 12000, 20000, 35000];
export const LEVEL_TITLES = [
  'Hatchling', 'Fledgling', 'Feathered', 'Preening', 'Strutter',
  'Plume Bearer', 'Iridescent', 'Crowned', 'Resplendent', 'Grand Peacock',
];

export function getXPForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level] || 35000;
}

export function getXPForCurrentLevel(level: number): number {
  return LEVEL_THRESHOLDS[level - 1] || 0;
}

export const mockHabits: Habit[] = [
  {
    _id: 'h1',
    name: 'Morning Run',
    icon: '🏃',
    color: '#00838F',
    category: 'Fitness',
    description: '5km before work',
    habitType: 'quantitative',
    quantitative: { targetUnit: 'km', weeklyTarget: 25 },
    schedule: { type: 'specific_days', days: ['MON', 'WED', 'FRI', 'SAT'], timesPerDay: 1 },
    restDayConfig: { allowed: true, maxPerWeek: 1 },
    sortOrder: 0,
    startDate: '2026-04-01',
    currentStreak: 14,
    longestStreak: 21,
    totalCheckIns: 42,
    lastCheckInLogicalDate: '2026-05-17',
    todayStatus: 'pending',
    todayProgress: 0,
    weeklyProgress: 14.2,
  },
  {
    _id: 'h2',
    name: 'Meditate',
    icon: '🧘',
    color: '#4DD0E1',
    category: 'Wellness',
    description: 'Mindfulness meditation',
    habitType: 'binary',
    schedule: { type: 'daily', timesPerDay: 1 },
    restDayConfig: { allowed: false, maxPerWeek: null },
    sortOrder: 1,
    startDate: '2026-03-15',
    currentStreak: 30,
    longestStreak: 30,
    totalCheckIns: 64,
    lastCheckInLogicalDate: '2026-05-18',
    todayStatus: 'completed',
  },
  {
    _id: 'h3',
    name: 'Read Books',
    icon: '📖',
    color: '#FFD54F',
    category: 'Learning',
    description: 'Read at least 20 pages',
    habitType: 'quantitative',
    quantitative: { targetUnit: 'pages', weeklyTarget: 100 },
    schedule: { type: 'daily', timesPerDay: 1 },
    restDayConfig: { allowed: true, maxPerWeek: 2 },
    sortOrder: 2,
    startDate: '2026-04-10',
    currentStreak: 7,
    longestStreak: 15,
    totalCheckIns: 28,
    lastCheckInLogicalDate: '2026-05-17',
    todayStatus: 'pending',
    todayProgress: 0,
    weeklyProgress: 62,
  },
  {
    _id: 'h4',
    name: 'Practice Guitar',
    icon: '🎸',
    color: '#F48FB1',
    category: 'Creative',
    description: 'Learn new chords and songs',
    habitType: 'binary',
    schedule: { type: 'specific_days', days: ['TUE', 'THU', 'SAT'], timesPerDay: 1 },
    restDayConfig: { allowed: false, maxPerWeek: null },
    sortOrder: 3,
    startDate: '2026-05-01',
    currentStreak: 5,
    longestStreak: 5,
    totalCheckIns: 8,
    todayStatus: 'not_scheduled',
  },
  {
    _id: 'h5',
    name: 'Drink Water',
    icon: '💧',
    color: '#00C853',
    category: 'Wellness',
    description: '8 glasses a day',
    habitType: 'binary',
    schedule: { type: 'times_per_day', timesPerDay: 8 },
    restDayConfig: { allowed: false, maxPerWeek: null },
    sortOrder: 4,
    startDate: '2026-04-01',
    currentStreak: 10,
    longestStreak: 18,
    totalCheckIns: 156,
    lastCheckInLogicalDate: '2026-05-18',
    todayStatus: 'pending',
  },
  {
    _id: 'h6',
    name: 'Journal',
    icon: '✍️',
    color: '#80CBC4',
    category: 'Creative',
    description: 'Write about your day',
    habitType: 'binary',
    schedule: { type: 'times_per_week', timesPerWeek: 4, timesPerDay: 1 },
    restDayConfig: { allowed: true, maxPerWeek: 1 },
    sortOrder: 5,
    startDate: '2026-03-20',
    currentStreak: 3,
    longestStreak: 12,
    totalCheckIns: 35,
    todayStatus: 'pending',
  },
];

export const mockTodos: Todo[] = [
  {
    _id: 't1',
    title: 'Submit project proposal',
    description: 'Final draft of the capstone project proposal with literature review',
    deadline: '2026-05-18T23:59:00Z',
    priority: 'critical',
    category: 'Work',
    subtasks: [
      { id: 's1', title: 'Write introduction', isCompleted: true },
      { id: 's2', title: 'Add references', isCompleted: true },
      { id: 's3', title: 'Proofread', isCompleted: false },
    ],
    isCompleted: false,
  },
  {
    _id: 't2',
    title: 'Buy groceries',
    description: 'Vegetables, fruits, milk, and bread',
    deadline: '2026-05-19T18:00:00Z',
    priority: 'medium',
    category: 'Personal',
    subtasks: [],
    isCompleted: false,
  },
  {
    _id: 't3',
    title: 'Review pull request',
    deadline: '2026-05-20T12:00:00Z',
    priority: 'high',
    category: 'Work',
    subtasks: [],
    isCompleted: false,
  },
  {
    _id: 't4',
    title: 'Schedule dentist appointment',
    deadline: '2026-05-22T17:00:00Z',
    priority: 'low',
    category: 'Health',
    subtasks: [],
    isCompleted: false,
  },
  {
    _id: 't5',
    title: 'Complete React tutorial',
    description: 'Finish the advanced patterns section',
    deadline: '2026-05-17T23:59:00Z',
    priority: 'high',
    category: 'Learning',
    subtasks: [
      { id: 's1', title: 'Render props', isCompleted: true },
      { id: 's2', title: 'Higher order components', isCompleted: true },
      { id: 's3', title: 'Custom hooks', isCompleted: true },
    ],
    isCompleted: true,
    completedAt: '2026-05-17T20:30:00Z',
  },
  {
    _id: 't6',
    title: 'Update resume',
    deadline: '2026-05-16T23:59:00Z',
    priority: 'medium',
    category: 'Personal',
    subtasks: [],
    isCompleted: false,
  },
];

export const mockBadges: Badge[] = [
  { key: 'first_feather', name: 'First Feather', description: 'Complete your first habit check-in', icon: '🦚', unlockCondition: 'Complete first check-in', earned: true, earnedAt: '2026-03-01' },
  { key: 'on_fire', name: 'On Fire', description: 'Reach a 7-day streak on any habit', icon: '🔥', unlockCondition: '7-day streak', earned: true, earnedAt: '2026-03-08' },
  { key: 'diamond_habit', name: 'Diamond Habit', description: 'Reach a 30-day streak on any habit', icon: '💎', unlockCondition: '30-day streak', earned: true, earnedAt: '2026-05-18' },
  { key: 'century', name: 'Century', description: '100 total check-ins ever', icon: '🏆', unlockCondition: '100 total check-ins', earned: true, earnedAt: '2026-04-20' },
  { key: 'perfect_week', name: 'Perfect Week', description: '100% completion on all habits for a full week', icon: '✨', unlockCondition: 'Perfect week', earned: true, earnedAt: '2026-04-28' },
  { key: 'rainbow', name: 'Rainbow', description: 'Complete check-ins in 5 different categories', icon: '🌈', unlockCondition: '5 categories', earned: true, earnedAt: '2026-05-10' },
  { key: 'athlete', name: 'Athlete', description: '50 check-ins in the Fitness category', icon: '🏃', unlockCondition: '50 Fitness check-ins', earned: false },
  { key: 'creator', name: 'Creator', description: '50 check-ins in the Creative category', icon: '🎨', unlockCondition: '50 Creative check-ins', earned: false },
  { key: 'scholar', name: 'Scholar', description: '50 check-ins in the Learning category', icon: '📖', unlockCondition: '50 Learning check-ins', earned: false },
  { key: 'zen_master', name: 'Zen Master', description: '50 check-ins in the Wellness category', icon: '🧘', unlockCondition: '50 Wellness check-ins', earned: false },
  { key: 'comeback_king', name: 'Comeback King', description: 'Resume a habit after a 7+ day gap', icon: '⚡', unlockCondition: 'Resume after 7+ day gap', earned: false },
  { key: 'milestone_365', name: 'Milestone 365', description: 'Any habit reaches a 365-day streak', icon: '📅', unlockCondition: '365-day streak', earned: false },
  { key: 'todo_hero', name: 'To-Do Hero', description: 'Complete 50 To-Do tasks', icon: '✅', unlockCondition: '50 tasks completed', earned: false },
  { key: 'night_owl', name: 'Night Owl', description: 'Check-in logged between 12 AM–3 AM', icon: '🦉', unlockCondition: 'Late night check-in', earned: true, earnedAt: '2026-04-05' },
  { key: 'target_crusher', name: 'Target Crusher', description: 'Hit weekly target 4 weeks in a row', icon: '🎯', unlockCondition: '4 consecutive target weeks', earned: false },
  { key: 'overachiever', name: 'Overachiever', description: 'Hit 150%+ of weekly target in a week', icon: '🚀', unlockCondition: '150% weekly target', earned: false },
  { key: 'perfect_month', name: 'Perfect Month', description: '100% completion all month', icon: '🌟', unlockCondition: 'Perfect month', earned: false },
];

export const mockWeeklyStats: WeeklyStats = {
  weekLabel: 'May 12 – 18',
  consistencyScore: 82,
  prevScore: 76,
  totalCheckIns: 24,
  perfectHabits: 2,
  totalXP: 320,
  perHabit: [
    { habitId: 'h6', name: 'Journal', icon: '✍️', color: '#80CBC4', completionRate: 50, checkInsDone: 2, checkInsExpected: 4 },
    { habitId: 'h3', name: 'Read Books', icon: '📖', color: '#FFD54F', completionRate: 71, checkInsDone: 5, checkInsExpected: 7 },
    { habitId: 'h1', name: 'Morning Run', icon: '🏃', color: '#00838F', completionRate: 75, checkInsDone: 3, checkInsExpected: 4 },
    { habitId: 'h5', name: 'Drink Water', icon: '💧', color: '#00C853', completionRate: 86, checkInsDone: 6, checkInsExpected: 7 },
    { habitId: 'h2', name: 'Meditate', icon: '🧘', color: '#4DD0E1', completionRate: 100, checkInsDone: 7, checkInsExpected: 7 },
    { habitId: 'h4', name: 'Practice Guitar', icon: '🎸', color: '#F48FB1', completionRate: 100, checkInsDone: 3, checkInsExpected: 3 },
  ],
};

export const mockWeeklyTrend = [
  { week: 'W11', score: 65 },
  { week: 'W12', score: 72 },
  { week: 'W13', score: 68 },
  { week: 'W14', score: 78 },
  { week: 'W15', score: 74 },
  { week: 'W16', score: 80 },
  { week: 'W17', score: 76 },
  { week: 'W18', score: 82 },
];

export const mockXPPerWeek = [
  { week: 'W11', xp: 180 },
  { week: 'W12', xp: 240 },
  { week: 'W13', xp: 210 },
  { week: 'W14', xp: 290 },
  { week: 'W15', xp: 260 },
  { week: 'W16', xp: 310 },
  { week: 'W17', xp: 280 },
  { week: 'W18', xp: 320 },
];

// Generate heatmap data for the year
export function generateMockHeatmap(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const start = new Date('2026-01-01');
  const today = new Date('2026-05-18');
  const cursor = new Date(start);
  while (cursor <= today) {
    const dateStr = cursor.toISOString().slice(0, 10);
    // Simulate varying activity levels
    const dayOfYear = Math.floor((cursor.getTime() - start.getTime()) / 86400000);
    const rand = Math.sin(dayOfYear * 0.3) * 0.5 + 0.5;
    const count = cursor < new Date('2026-03-01') ? 0 : Math.floor(rand * 6);
    days.push({ date: dateStr, count });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export const mockCheckIns: CheckIn[] = [
  { _id: 'c1', habitId: 'h2', logicalDate: '2026-05-18', slotIndex: 0, xpAwarded: 10, createdAt: '2026-05-18T07:30:00Z' },
  { _id: 'c2', habitId: 'h1', logicalDate: '2026-05-17', slotIndex: 0, amount: 5.2, xpAwarded: 10, createdAt: '2026-05-17T06:45:00Z' },
  { _id: 'c3', habitId: 'h2', logicalDate: '2026-05-17', slotIndex: 0, xpAwarded: 10, createdAt: '2026-05-17T07:20:00Z' },
  { _id: 'c4', habitId: 'h3', logicalDate: '2026-05-17', slotIndex: 0, amount: 25, note: 'Finished chapter 4 of Atomic Habits', xpAwarded: 10, createdAt: '2026-05-17T22:00:00Z' },
];

export const motivationalQuotes = [
  "Every day is a chance to build something great. 🦚",
  "Small steps lead to giant leaps. Keep going! 💪",
  "Consistency is the mother of mastery. 🔥",
  "Your streaks tell the story of your discipline. ✨",
  "The peacock's beauty comes from patience. So does yours. 🌟",
  "One more day, one more step closer to your goals. 🎯",
  "Don't break the chain. You're doing amazing! 🏆",
];
