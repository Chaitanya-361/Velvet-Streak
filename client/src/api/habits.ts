import { api } from './client';
import type { Habit } from '../types';

export async function fetchHabits(): Promise<Habit[]> {
  const res = await api<{ data: Habit[] }>('/habits');
  return res.data;
}

export async function fetchHabit(id: string): Promise<Habit> {
  const res = await api<{ data: Habit }>(`/habits/${id}`);
  return res.data;
}

export async function createHabit(data: Partial<Habit>): Promise<Habit> {
  const res = await api<{ data: Habit }>('/habits', { method: 'POST', body: data });
  return res.data;
}

export async function updateHabit(id: string, data: Partial<Habit>): Promise<Habit> {
  const res = await api<{ data: Habit }>(`/habits/${id}`, { method: 'PATCH', body: data });
  return res.data;
}

export async function deleteHabit(id: string): Promise<void> {
  await api(`/habits/${id}`, { method: 'DELETE' });
}

export async function reorderHabits(order: { habitId: string; sortOrder: number }[]): Promise<Habit[]> {
  const res = await api<{ data: Habit[] }>('/habits/reorder', { method: 'PATCH', body: { order } });
  return res.data;
}

export async function fetchHabitCalendar(id: string, month?: string): Promise<any> {
  const q = month ? `?month=${month}` : '';
  const res = await api(`/habits/${id}/calendar${q}`);
  return res.data;
}

// Check-ins
export async function createCheckIn(habitId: string, amount?: number, note?: string) {
  const res = await api('/checkins', {
    method: 'POST',
    body: { habitId, amount, note },
  });
  return res.data;
}

export async function fetchCheckIns(params?: { habitId?: string; from?: string; to?: string }) {
  const query = new URLSearchParams();
  if (params?.habitId) query.set('habitId', params.habitId);
  if (params?.from) query.set('from', params.from);
  if (params?.to) query.set('to', params.to);
  const q = query.toString() ? `?${query}` : '';
  const res = await api(`/checkins${q}`);
  return res.data;
}

export async function undoCheckIn(id: string) {
  await api(`/checkins/${id}`, { method: 'DELETE' });
}
