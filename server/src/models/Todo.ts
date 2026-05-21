import mongoose, { Schema, Document } from 'mongoose';
import { Todo as ITodo } from '../types';

export interface ITodoDocument extends Omit<ITodo, '_id'>, Document {}

const TodoSchema = new Schema<ITodoDocument>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: null },
    deadline: { type: String, required: true },
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
    category: { type: String, default: null },
    subtasks: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
      },
    ],
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: String, default: null },
    xpAwarded: { type: Number, default: null },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: false }
);

export const Todo = mongoose.model<ITodoDocument>('Todo', TodoSchema);
