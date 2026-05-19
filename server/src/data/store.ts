/**
 * In-memory data store — replaces MongoDB for now.
 * All data lives here and resets on server restart.
 * When MongoDB is connected, each collection will become a Mongoose model.
 */
import type { User, Habit, CheckIn, RestDay, Todo, Badge } from '../types';
import { badgeSeedData } from './badges';

class Store {
  users: User[] = [];
  habits: Habit[] = [];
  checkIns: CheckIn[] = [];
  restDays: RestDay[] = [];
  todos: Todo[] = [];
  badges: Badge[] = badgeSeedData;

  // Helpers
  findUserById(id: string): User | undefined {
    return this.users.find(u => u._id === id);
  }
  findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  findUserByUsername(username: string): User | undefined {
    return this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }
  findHabitsByUser(userId: string): Habit[] {
    return this.habits.filter(h => h.userId === userId).sort((a, b) => a.sortOrder - b.sortOrder);
  }
  findHabitById(id: string): Habit | undefined {
    return this.habits.find(h => h._id === id);
  }
  findCheckIns(filter: Partial<CheckIn>): CheckIn[] {
    return this.checkIns.filter(c => {
      for (const [key, val] of Object.entries(filter)) {
        if ((c as any)[key] !== val) return false;
      }
      return true;
    });
  }
  findRestDays(filter: Partial<RestDay>): RestDay[] {
    return this.restDays.filter(r => {
      for (const [key, val] of Object.entries(filter)) {
        if ((r as any)[key] !== val) return false;
      }
      return true;
    });
  }
  findTodosByUser(userId: string): Todo[] {
    return this.todos.filter(t => t.userId === userId);
  }
  findTodoById(id: string): Todo | undefined {
    return this.todos.find(t => t._id === id);
  }
  deleteHabitCascade(habitId: string): void {
    this.checkIns = this.checkIns.filter(c => c.habitId !== habitId);
    this.restDays = this.restDays.filter(r => r.habitId !== habitId);
    this.habits = this.habits.filter(h => h._id !== habitId);
  }
}

export const store = new Store();
