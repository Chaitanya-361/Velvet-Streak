import { Response, NextFunction } from 'express';
import { AppError, AuthRequest } from '../types';
import { getCurrentLogicalDate, getISOWeekLabel } from '../services/dayBoundary.service';
import { User } from '../models/User';
import { Habit } from '../models/Habit';
import { RestDay } from '../models/RestDay';

// POST /api/restdays
export async function createRestDay(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const user = await User.findById(userId);
    if (!user) throw new AppError('NOT_FOUND', 404, 'User not found');
    const { habitId } = req.body;

    const habit = await Habit.findById(habitId);
    if (!habit || habit.userId.toString() !== userId) {
      throw new AppError('NOT_FOUND', 404, 'Habit not found');
    }
    if (!habit.restDayConfig.allowed) {
      throw new AppError('BAD_REQUEST', 400, 'Rest days not allowed for this habit');
    }

    const logicalDate = getCurrentLogicalDate(user.preferences);
    const weekLabel = getISOWeekLabel(logicalDate);

    // Check weekly budget
    const weekRestDays = await RestDay.find({ habitId, weekLabel });
    if (habit.restDayConfig.maxPerWeek !== null && weekRestDays.length >= habit.restDayConfig.maxPerWeek) {
      throw new AppError('BAD_REQUEST', 400, `Rest day budget (${habit.restDayConfig.maxPerWeek}/week) exhausted`);
    }

    // Check no duplicate
    const existing = await RestDay.findOne({ habitId, logicalDate });
    if (existing) {
      throw new AppError('CONFLICT', 409, 'Rest day already marked for today');
    }

    const restDay = new RestDay({
      userId,
      habitId,
      logicalDate,
      weekLabel,
      createdAt: new Date().toISOString(),
    });

    await restDay.save();

    res.status(201).json({
      success: true,
      data: {
        restDay,
        weeklyUsed: weekRestDays.length + 1,
        weeklyBudget: habit.restDayConfig.maxPerWeek,
      },
    });
  } catch (err) { next(err); }
}

// DELETE /api/restdays/:id
export async function undoRestDay(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const restDay = await RestDay.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!restDay) throw new AppError('NOT_FOUND', 404, 'Rest day not found');

    res.json({ success: true, data: { message: 'Rest day undone' } });
  } catch (err) { next(err); }
}
