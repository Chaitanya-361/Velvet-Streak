import type { Badge } from '../types';

export const badgeSeedData: Badge[] = [
  { key: 'first_feather', name: 'First Feather', description: 'Complete your first habit check-in', icon: '🦚', unlockCondition: 'Complete first check-in', triggerKey: 'first_feather', xpReward: 10 },
  { key: 'on_fire', name: 'On Fire', description: 'Reach a 7-day streak on any habit', icon: '🔥', unlockCondition: '7-day streak', triggerKey: 'on_fire', xpReward: 50 },
  { key: 'diamond_habit', name: 'Diamond Habit', description: 'Reach a 30-day streak on any habit', icon: '💎', unlockCondition: '30-day streak', triggerKey: 'diamond_habit', xpReward: 200 },
  { key: 'century', name: 'Century', description: '100 total check-ins ever', icon: '🏆', unlockCondition: '100 total check-ins', triggerKey: 'century', xpReward: 100 },
  { key: 'perfect_week', name: 'Perfect Week', description: '100% completion on all habits for a full week', icon: '✨', unlockCondition: 'Perfect week', triggerKey: 'perfect_week', xpReward: 75 },
  { key: 'perfect_month', name: 'Perfect Month', description: '100% completion all month', icon: '🌟', unlockCondition: 'Perfect month', triggerKey: 'perfect_month', xpReward: 500 },
  { key: 'rainbow', name: 'Rainbow', description: 'Complete check-ins in 5 different categories', icon: '🌈', unlockCondition: '5 categories', triggerKey: 'rainbow', xpReward: 50 },
  { key: 'athlete', name: 'Athlete', description: '50 check-ins in the Fitness category', icon: '🏃', unlockCondition: '50 Fitness check-ins', triggerKey: 'athlete', xpReward: 75 },
  { key: 'creator', name: 'Creator', description: '50 check-ins in the Creative category', icon: '🎨', unlockCondition: '50 Creative check-ins', triggerKey: 'creator', xpReward: 75 },
  { key: 'scholar', name: 'Scholar', description: '50 check-ins in the Learning category', icon: '📖', unlockCondition: '50 Learning check-ins', triggerKey: 'scholar', xpReward: 75 },
  { key: 'zen_master', name: 'Zen Master', description: '50 check-ins in the Wellness category', icon: '🧘', unlockCondition: '50 Wellness check-ins', triggerKey: 'zen_master', xpReward: 75 },
  { key: 'comeback_king', name: 'Comeback King', description: 'Resume a habit after a 7+ day gap', icon: '⚡', unlockCondition: 'Resume after 7+ day gap', triggerKey: 'comeback_king', xpReward: 50 },
  { key: 'milestone_365', name: 'Milestone 365', description: 'Any habit reaches a 365-day streak', icon: '📅', unlockCondition: '365-day streak', triggerKey: 'milestone_365', xpReward: 1000 },
  { key: 'todo_hero', name: 'To-Do Hero', description: 'Complete 50 To-Do tasks', icon: '✅', unlockCondition: '50 tasks completed', triggerKey: 'todo_hero', xpReward: 75 },
  { key: 'night_owl', name: 'Night Owl', description: 'Check-in logged between 12 AM–3 AM', icon: '🦉', unlockCondition: 'Late night check-in', triggerKey: 'night_owl', xpReward: 20 },
  { key: 'target_crusher', name: 'Target Crusher', description: 'Hit weekly target 4 weeks in a row', icon: '🎯', unlockCondition: '4 consecutive target weeks', triggerKey: 'target_crusher', xpReward: 100 },
  { key: 'overachiever', name: 'Overachiever', description: 'Hit 150%+ of weekly target in a week', icon: '🚀', unlockCondition: '150% weekly target', triggerKey: 'overachiever', xpReward: 50 },
];
