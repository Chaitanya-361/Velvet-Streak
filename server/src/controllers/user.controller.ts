import { Response, NextFunction } from 'express';
import { AppError, AuthRequest } from '../types';
import { getXPInfo } from '../services/gamification.service';
import { User } from '../models/User';
import { Habit } from '../models/Habit';
import { CheckIn } from '../models/CheckIn';
import { RestDay } from '../models/RestDay';
import { Todo } from '../models/Todo';
import { Badge } from '../models/Badge';

// GET /api/users/profile
export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const habits = await Habit.find({ userId: user._id.toString() });
    const checkInsCount = await CheckIn.countDocuments({ userId: user._id.toString() });
    
    // We need to pass a plain object to getXPInfo if it expects the exact type, but it should be fine.
    const xpInfo = getXPInfo(user.toObject());

    const userObj = user.toObject();
    const { passwordHash, refreshTokens, emailVerifyToken, emailVerifyExpiry, passwordResetToken, passwordResetExpiry, ...safe } = userObj;
    if (safe._id) (safe as any)._id = safe._id.toString();

    res.json({
      success: true,
      data: {
        ...safe,
        xpInfo,
        totalHabits: habits.length,
        totalCheckIns: checkInsCount,
        longestStreak: habits.length > 0 ? Math.max(...habits.map(h => h.longestStreak)) : 0,
      },
    });
  } catch (err) { next(err); }
}

// PATCH /api/users/profile
export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const { displayName, bio, username } = req.body;
    if (displayName !== undefined) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (username !== undefined) {
      const existing = await User.findOne({ username });
      if (existing && existing._id.toString() !== user._id.toString()) {
        throw new AppError('CONFLICT', 409, 'Username already taken');
      }
      user.username = username;
    }
    user.updatedAt = new Date().toISOString();
    await user.save();

    const userObj = user.toObject();
    const { passwordHash, refreshTokens, emailVerifyToken, emailVerifyExpiry, passwordResetToken, passwordResetExpiry, ...safe } = userObj;
    if (safe._id) (safe as any)._id = safe._id.toString();

    res.json({ success: true, data: safe });
  } catch (err) { next(err); }
}

// PATCH /api/users/settings
export async function updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const { timezone, dayBoundaryTime, weekStartDay, theme } = req.body;
    
    // Create a new preferences object to ensure Mongoose detects the change properly, 
    // or just set individual fields since it's defined in the schema.
    if (timezone !== undefined) user.preferences.timezone = timezone;
    if (dayBoundaryTime !== undefined) user.preferences.dayBoundaryTime = dayBoundaryTime;
    if (weekStartDay !== undefined) user.preferences.weekStartDay = weekStartDay;
    if (theme !== undefined) user.preferences.theme = theme;
    
    // Explicitly mark modified if nested
    user.markModified('preferences');
    user.updatedAt = new Date().toISOString();
    await user.save();

    res.json({ success: true, data: { preferences: user.preferences } });
  } catch (err) { next(err); }
}

// GET /api/users/badges
export async function getBadges(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const earnedMap = new Map(user.badgesEarned.map(b => [b.badgeKey, b.earnedAt]));
    const allBadges = await Badge.find({});

    const badges = allBadges.map(badge => ({
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
export async function exportData(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const habits = await Habit.find({ userId });
    const checkIns = await CheckIn.find({ userId });
    const restDays = await RestDay.find({ userId });
    const todos = await Todo.find({ userId });

    const userObj = user.toObject();
    const { passwordHash, refreshTokens, ...safeUser } = userObj;
    if (safeUser._id) (safeUser as any)._id = safeUser._id.toString();

    res.json({
      success: true,
      data: { 
        user: safeUser, 
        habits, 
        checkIns, 
        restDays, 
        todos, 
        exportedAt: new Date().toISOString() 
      },
    });
  } catch (err) { next(err); }
}

// DELETE /api/users/account
export async function deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;

    await Habit.deleteMany({ userId });
    await CheckIn.deleteMany({ userId });
    await RestDay.deleteMany({ userId });
    await Todo.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ success: true, data: { message: 'Account deleted' } });
  } catch (err) { next(err); }
}
