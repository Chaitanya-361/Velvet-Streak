import { User } from '../models/User';
import { Habit } from '../models/Habit';
import { CheckIn } from '../models/CheckIn';
import { Todo } from '../models/Todo';
import { Badge } from '../models/Badge';
import type { User as IUser } from '../types';

const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000, 7000, 12000, 20000, 35000];

export async function awardXP(userId: string, amount: number): Promise<{ levelledUp: boolean; newLevel: number }> {
  const user = await User.findById(userId);
  if (!user) return { levelledUp: false, newLevel: 1 };

  user.xp += amount;
  user.updatedAt = new Date().toISOString();

  const oldLevel = user.level;
  const newLevel = LEVEL_THRESHOLDS.filter(t => user.xp >= t).length;
  if (newLevel > oldLevel) {
    user.level = Math.min(newLevel, 10);
  }

  await user.save();
  return { levelledUp: newLevel > oldLevel, newLevel: user.level };
}

export async function checkBadges(userId: string): Promise<string[]> {
  const user = await User.findById(userId);
  if (!user) return [];

  const earnedKeys = new Set(user.badgesEarned.map(b => b.badgeKey));
  const newBadges: string[] = [];
  
  const userCheckIns = await CheckIn.find({ userId });
  const userHabits = await Habit.find({ userId });
  const completedTodos = await Todo.find({ userId, isCompleted: true });
  
  const allBadges = await Badge.find({});

  // Evaluate each unearned badge
  for (const badge of allBadges) {
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
        const categories = new Set();
        for (const c of userCheckIns) {
          const h = userHabits.find(hab => hab._id.toString() === c.habitId.toString());
          if (h?.category) categories.add(h.category);
        }
        earned = categories.size >= 5;
        break;
      }
      case 'athlete':
        earned = userCheckIns.filter(c => userHabits.find(h => h._id.toString() === c.habitId.toString())?.category === 'Fitness').length >= 50;
        break;
      case 'creator':
        earned = userCheckIns.filter(c => userHabits.find(h => h._id.toString() === c.habitId.toString())?.category === 'Creative').length >= 50;
        break;
      case 'scholar':
        earned = userCheckIns.filter(c => userHabits.find(h => h._id.toString() === c.habitId.toString())?.category === 'Learning').length >= 50;
        break;
      case 'zen_master':
        earned = userCheckIns.filter(c => userHabits.find(h => h._id.toString() === c.habitId.toString())?.category === 'Wellness').length >= 50;
        break;
      default:
        break;
    }

    if (earned) {
      user.badgesEarned.push({ badgeKey: badge.key, earnedAt: new Date().toISOString() });
      await awardXP(userId, badge.xpReward);
      newBadges.push(badge.key);
    }
  }

  if (newBadges.length > 0) {
    await user.save();
  }

  return newBadges;
}

// Accepts a generic object matching User shape, but avoiding strict mongoose document checking
export function getXPInfo(user: { level: number, xp: number }) {
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
