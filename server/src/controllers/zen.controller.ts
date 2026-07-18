import { Response, NextFunction } from 'express';
import { AppError, AuthRequest } from '../types';
import { ZenSession } from '../models/ZenSession';
import { getCurrentLogicalDate, formatDate } from '../services/dayBoundary.service';
import { User } from '../models/User';

// POST /api/zen/sessions — save a completed focus session
export async function createZenSession(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const { startedAt, endedAt, durationSeconds } = req.body;

    if (!startedAt || !endedAt || !durationSeconds || typeof durationSeconds !== 'number' || durationSeconds < 1) {
      throw new AppError('VALIDATION_ERROR', 400, 'startedAt, endedAt, and durationSeconds (>= 1) are required');
    }

    const user = await User.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const logicalDate = getCurrentLogicalDate(user.preferences);

    const session = await ZenSession.create({
      userId,
      startedAt,
      endedAt,
      durationSeconds,
      logicalDate,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      data: session.toObject(),
    });
  } catch (err) { next(err); }
}

// GET /api/zen/sessions/weekly — per-day breakdown for the current week
export async function getWeeklyZenSessions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');

    const today = new Date();
    // Calculate Monday of the current week
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startDate = formatDate(monday);
    const endDate = formatDate(sunday);

    const sessions = await ZenSession.find({
      userId,
      logicalDate: { $gte: startDate, $lte: endDate },
    });

    // Build per-day map
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const days: { label: string; date: string; totalSeconds: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = formatDate(d);
      const daySessions = sessions.filter(s => s.logicalDate === dateStr);
      const totalSeconds = daySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
      days.push({
        label: dayLabels[i],
        date: dateStr,
        totalSeconds,
      });
    }

    const weekTotalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);

    res.json({
      success: true,
      data: { days, weekTotalSeconds },
    });
  } catch (err) { next(err); }
}

// GET /api/zen/sessions/weekly-total — total seconds for stats page
export async function getWeeklyZenTotal(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startDate = formatDate(monday);
    const endDate = formatDate(sunday);

    const sessions = await ZenSession.find({
      userId,
      logicalDate: { $gte: startDate, $lte: endDate },
    });

    const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
    const sessionCount = sessions.length;

    res.json({
      success: true,
      data: { totalSeconds, sessionCount },
    });
  } catch (err) { next(err); }
}
