import { Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import { store } from '../data/store';
import { AppError, AuthRequest } from '../types';
import { awardXP, checkBadges } from '../services/gamification.service';

const TODO_COMPLETE_XP = 5;

// GET /api/todos
export function getTodos(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let todos = store.findTodosByUser(req.user!._id);

    // Filters
    const { priority, completed, category, from, to } = req.query;
    if (priority) todos = todos.filter(t => t.priority === priority);
    if (completed !== undefined) todos = todos.filter(t => t.isCompleted === (completed === 'true'));
    if (category) todos = todos.filter(t => t.category === category);
    if (from) todos = todos.filter(t => t.deadline >= (from as string));
    if (to) todos = todos.filter(t => t.deadline <= (to as string));

    // Sort: overdue first, then by deadline
    todos.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return a.deadline.localeCompare(b.deadline);
    });

    res.json({ success: true, data: todos });
  } catch (err) { next(err); }
}

// GET /api/todos/:id
export function getTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const todo = store.findTodoById(req.params.id);
    if (!todo || todo.userId !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Todo not found');
    }
    res.json({ success: true, data: todo });
  } catch (err) { next(err); }
}

// POST /api/todos
export function createTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!._id;
    const { title, description, deadline, priority, category, subtasks } = req.body;
    const now = new Date().toISOString();

    const todo = {
      _id: uuid(),
      userId,
      title,
      description: description || null,
      deadline,
      priority: priority || 'medium',
      category: category || null,
      subtasks: (subtasks || []).map((s: any) => ({
        id: uuid(),
        title: s.title,
        isCompleted: false,
      })),
      isCompleted: false,
      completedAt: null,
      xpAwarded: null,
      createdAt: now,
      updatedAt: now,
    };

    store.todos.push(todo);
    res.status(201).json({ success: true, data: todo });
  } catch (err) { next(err); }
}

// PATCH /api/todos/:id
export function updateTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const todo = store.findTodoById(req.params.id);
    if (!todo || todo.userId !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Todo not found');
    }

    const { title, description, deadline, priority, category, subtasks } = req.body;
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (deadline !== undefined) todo.deadline = deadline;
    if (priority !== undefined) todo.priority = priority;
    if (category !== undefined) todo.category = category;
    if (subtasks !== undefined) todo.subtasks = subtasks;
    todo.updatedAt = new Date().toISOString();

    res.json({ success: true, data: todo });
  } catch (err) { next(err); }
}

// DELETE /api/todos/:id
export function deleteTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const idx = store.todos.findIndex(t => t._id === req.params.id && t.userId === req.user!._id);
    if (idx === -1) throw new AppError('NOT_FOUND', 404, 'Todo not found');

    store.todos.splice(idx, 1);
    res.json({ success: true, data: { message: 'Todo deleted' } });
  } catch (err) { next(err); }
}

// PATCH /api/todos/:id/complete
export function completeTodo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const todo = store.findTodoById(req.params.id);
    if (!todo || todo.userId !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Todo not found');
    }

    if (todo.isCompleted) {
      // Uncomplete
      todo.isCompleted = false;
      todo.completedAt = null;
      // Remove awarded XP
      if (todo.xpAwarded) {
        const user = store.findUserById(req.user!._id)!;
        user.xp = Math.max(0, user.xp - todo.xpAwarded);
        todo.xpAwarded = null;
      }
    } else {
      // Complete
      todo.isCompleted = true;
      todo.completedAt = new Date().toISOString();
      todo.xpAwarded = TODO_COMPLETE_XP;
      awardXP(req.user!._id, TODO_COMPLETE_XP);
      checkBadges(req.user!._id);
    }
    todo.updatedAt = new Date().toISOString();

    res.json({ success: true, data: todo });
  } catch (err) { next(err); }
}

// PATCH /api/todos/:id/subtasks/:subtaskId/toggle
export function toggleSubtask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const todo = store.findTodoById(req.params.id);
    if (!todo || todo.userId !== req.user!._id) {
      throw new AppError('NOT_FOUND', 404, 'Todo not found');
    }

    const subtask = todo.subtasks.find(s => s.id === req.params.subtaskId);
    if (!subtask) throw new AppError('NOT_FOUND', 404, 'Subtask not found');

    subtask.isCompleted = !subtask.isCompleted;
    todo.updatedAt = new Date().toISOString();

    res.json({ success: true, data: todo });
  } catch (err) { next(err); }
}
