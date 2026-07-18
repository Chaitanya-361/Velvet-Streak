import { api } from './client';

export async function saveZenSession(data: { startedAt: string; endedAt: string; durationSeconds: number }) {
  const res = await api('/zen/sessions', { method: 'POST', body: data });
  return res.data;
}

export async function fetchWeeklyZenSessions() {
  const res = await api('/zen/sessions/weekly');
  return res.data;
}

export async function fetchWeeklyZenTotal() {
  const res = await api('/zen/sessions/weekly-total');
  return res.data;
}
