import { store } from '../data/store';
import type { User } from '../types';

const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000, 7000, 12000, 20000, 35000];

export function awardXP(userId: string, amount: number): { levelledUp: boolean; newLevel: number } {
  const user = store.findUserById(userId);
  if (!user) return { levelledUp: false, newLevel: 1 };

  user.xp += amount;
  user.updatedAt = new Date().toISOString();

  const oldLevel = user.level;
  const newLevel = LEVEL_THRESHOLDS.filter(t => user.xp >= t).length;
  if (newLevel > oldLevel) {
    user.level = Math.min(newLevel, 10);
  }

  return { levelledUp: newLevel > oldLevel, newLevel: user.level };
}

export function checkBadges(userId: string): string[] {
  const user = store.findUserById(userId);
  if (!user) return [];

  const earnedKeys = new Set(user.badgesEarned.map(b => b.badgeKey));
  const newBadges: string[] = [];
  const userCheckIns = store.checkIns.filter(c => c.userId === userId);
  const userHabits = store.habits.filter(h => h.userId === userId);
  const completedTodos = store.todos.filter(t => t.userId === userId && t.isCompleted);

  // Evaluate each unearned badge
  for (const badge of store.badges) {
    if (earnedKeys.has(badge.key)) continue;

    let earned = false;
    switch (badge.triggerKey) {
      case 'first_feather':
        earned = userCheckIns.length >= 1;
        break;
      case 'on_fire':
        earned = userHabits.some(h => h.currentStreak >= 7);
        break;
      case 'diamond_habit':
        earned = userHabits.some(h => h.currentStreak >= 30);
        break;
      case 'century':
        earned = userCheckIns.length >= 100;
        break;
      case 'milestone_365':
        earned = userHabits.some(h => h.currentStreak >= 365);
        break;
      case 'todo_hero':
        earned = completedTodos.length >= 50;
        break;
      case 'rainbow': {
        const categories = new Set(userCheckIns.map(c => {
          const h = store.findHabitById(c.habitId);
          return h?.category;
        }).filter(Boolean));
        earned = categories.size >= 5;
        break;
      }
      case 'athlete':
        earned = userCheckIns.filter(c => store.findHabitById(c.habitId)?.category === 'Fitness').length >= 50;
        break;
      case 'creator':
        earned = userCheckIns.filter(c => store.findHabitById(c.habitId)?.category === 'Creative').length >= 50;
        break;
      case 'scholar':
        earned = userCheckIns.filter(c => store.findHabitById(c.habitId)?.category === 'Learning').length >= 50;
        break;
      case 'zen_master':
        earned = userCheckIns.filter(c => store.findHabitById(c.habitId)?.category === 'Wellness').length >= 50;
        break;
      // Others require more complex evaluation — simplified for now
      default:
        break;
    }

    if (earned) {
      user.badgesEarned.push({ badgeKey: badge.key, earnedAt: new Date().toISOString() });
      awardXP(userId, badge.xpReward);
      newBadges.push(badge.key);
    }
  }

  return newBadges;
}

export function getXPInfo(user: User) {
  const level = user.level;
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[level] || 35000;
  return {
    total: user.xp,
    level: user.level,
    toNextLevel: nextLevelXP - user.xp,
    currentLevelXP,
    nextLevelXP,
  };
}
