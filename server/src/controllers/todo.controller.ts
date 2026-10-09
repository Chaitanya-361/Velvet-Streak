import { Response, NextFunction } from 'express';
import { AppError, AuthRequest } from '../types';
import { awardXP, checkBadges } from '../services/gamification.service';
import { Todo } from '../models/Todo';
import { User } from '../models/User';

const TODO_COMPLETE_XP = 5;

// GET /api/todos
export async function getTodos(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query: any = { userId: req.user!._id };

    // Filters
    const { priority, completed, category, from, to } = req.query;
    if (priority) query.priority = priority;
    if (completed !== undefined) query.isCompleted = completed === 'true';
    if (category) query.category = category;
    if (from || to) {
      query.deadline = {};
      if (from) query.deadline.$gte = from;
      if (to) query.deadline.$lte = to;
    }

    let todos = await Todo.find(query);

    // Sort: overdue first, then by deadline
    todos.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return a.deadline.localeCompare(b.deadline);
    });

    res.json({ success: true, data: todos });
  } catch (err) { next(err); }
}

// GET /api/todos/:id
export async function getTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!todo) {
      throw new AppError('NOT_FOUND', 404, 'Todo not found');
    }
    res.json({ success: true, data: todo });
  } catch (err) { next(err); }
}

// POST /api/todos
export async function createTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const { title, description, deadline, priority, category } = req.body;
    const now = new Date().toISOString();

    const todo = new Todo({
      userId,
      title,
      description: description || null,
      deadline,
      priority: priority || 'medium',
      category: category || null,
      isCompleted: false,
      completedAt: null,
      xpAwarded: null,
      createdAt: now,
      updatedAt: now,
    });

    await todo.save();
    res.status(201).json({ success: true, data: todo });
  } catch (err) { next(err); }
}

// PATCH /api/todos/:id
export async function updateTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!todo) {
      throw new AppError('NOT_FOUND', 404, 'Todo not found');
    }

    const { title, description, deadline, priority, category } = req.body;
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (deadline !== undefined) todo.deadline = deadline;
    if (priority !== undefined) todo.priority = priority;
    if (category !== undefined) todo.category = category;
    todo.updatedAt = new Date().toISOString();

    await todo.save();
    res.json({ success: true, data: todo });
  } catch (err) { next(err); }
}

// DELETE /api/todos/:id
export async function deleteTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!todo) throw new AppError('NOT_FOUND', 404, 'Todo not found');

    res.json({ success: true, data: { message: 'Todo deleted' } });
  } catch (err) { next(err); }
}

// PATCH /api/todos/:id/complete
export async function completeTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!todo) {
      throw new AppError('NOT_FOUND', 404, 'Todo not found');
    }

    if (todo.isCompleted) {
      // Uncomplete
      todo.isCompleted = false;
      todo.completedAt = null;
      // Remove awarded XP
      if (todo.xpAwarded) {
        const user = await User.findById(req.user!._id);
        if (user) {
          user.xp = Math.max(0, user.xp - todo.xpAwarded);
          await user.save();
        }
        todo.xpAwarded = null;
      }
    } else {
      // Complete
      todo.isCompleted = true;
      todo.completedAt = new Date().toISOString();
      todo.xpAwarded = TODO_COMPLETE_XP;
      await awardXP(req.user!._id, TODO_COMPLETE_XP);
      await checkBadges(req.user!._id);
    }
    todo.updatedAt = new Date().toISOString();

    await todo.save();
    res.json({ success: true, data: todo });
  } catch (err) { next(err); }
}
