import { Response, NextFunction } from 'express';
import { store } from '../data/store';
import { AppError, AuthRequest } from '../types';
import { getXPInfo } from '../services/gamification.service';

// GET /api/users/profile
export function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = store.findUserById(req.user!._id);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const habits = store.findHabitsByUser(user._id);
    const checkIns = store.checkIns.filter(c => c.userId === user._id);
    const xpInfo = getXPInfo(user);

    const { passwordHash, refreshTokens, emailVerifyToken, emailVerifyExpiry, passwordResetToken, passwordResetExpiry, ...safe } = user;

    res.json({
      success: true,
      data: {
        ...safe,
        xpInfo,
        totalHabits: habits.length,
        totalCheckIns: checkIns.length,
        longestStreak: habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak)) : 0,
      },
    });
  } catch (err) { next(err); }
}

// PATCH /api/users/profile
export function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = store.findUserById(req.user!._id);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const { displayName, bio, username } = req.body;
    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (username !== undefined) {
      const existing = store.findUserByUsername(username);
      if (existing && existing._id !== user._id) {
        throw new AppError('CONFLICT', 409, 'Username already taken');
      }
      user.username = username;
    }
    user.updatedAt = new Date().toISOString();

    const { passwordHash, refreshTokens, emailVerifyToken, emailVerifyExpiry, passwordResetToken, passwordResetExpiry, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err) { next(err); }
}

// PATCH /api/users/settings
export function updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = store.findUserById(req.user!._id);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const { timezone, dayBoundaryTime, weekStartDay, theme } = req.body;
    if (timezone !== undefined) user.preferences.timezone = timezone;
    if (dayBoundaryTime !== undefined) user.preferences.dayBoundaryTime = dayBoundaryTime;
    if (weekStartDay !== undefined) user.preferences.weekStartDay = weekStartDay;
    if (theme !== undefined) user.preferences.theme = theme;
    user.updatedAt = new Date().toISOString();

    res.json({ success: true, data: { preferences: user.preferences } });
  } catch (err) { next(err); }
}

// GET /api/users/badges
export function getBadges(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = store.findUserById(req.user!._id);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const earnedMap = new Map(user.badgesEarned.map(b => [b.badgeKey, b.earnedAt]));

    const badges = store.badges.map(badge => ({
      key: badge.key,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      unlockCondition: badge.unlockCondition,
      xpReward: badge.xpReward,
      earned: earnedMap.has(badge.key),
      earnedAt: earnedMap.get(badge.key) ?? null,
    }));

    res.json({ success: true, data: badges });
  } catch (err) { next(err); }
}

// GET /api/users/export
export function exportData(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const user = store.findUserById(userId);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const habits = store.findHabitsByUser(userId);
    const checkIns = store.checkIns.filter(c => c.userId === userId);
    const restDays = store.restDays.filter(r => r.userId === userId);
    const todos = store.findTodosByUser(userId);

    const { passwordHash, refreshTokens, ...safeUser } = user;

    res.json({
      success: true,
      data: { user: safeUser, habits, checkIns, restDays, todos, exportedAt: new Date().toISOString() },
    });
  } catch (err) { next(err); }
}

// DELETE /api/users/account
export function deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;

    // Remove all user data
    store.users = store.users.filter(u => u._id !== userId);
    store.habits = store.habits.filter(h => h.userId !== userId);
    store.checkIns = store.checkIns.filter(c => c.userId !== userId);
    store.restDays = store.restDays.filter(r => r.userId !== userId);
    store.todos = store.todos.filter(t => t.userId !== userId);

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ success: true, data: { message: 'Account deleted' } });
  } catch (err) { next(err); }
}
