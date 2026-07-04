import { api } from './client';

export async function fetchDashboard() {
  const res = await api('/stats/dashboard');
  return res.data;
}

export async function fetchWeeklyStats(weekOffset = 0) {
  const res = await api(`/stats/weekly?weekOffset=${weekOffset}`);
  return res.data;
}

export async function fetchHeatmap(year?: number) {
  const y = year || new Date().getFullYear();
  const res = await api(`/stats/heatmap?year=${y}`);
  return res.data;
}

export async function fetchProfile() {
  const res = await api('/users/profile');
  return res.data;
}

export async function updateProfile(data: { displayName?: string; bio?: string; username?: string }) {
  const res = await api('/users/profile', { method: 'PATCH', body: data });
  return res.data;
}

export async function updateSettings(data: { timezone?: string; dayBoundaryTime?: string; weekStartDay?: string }) {
  const res = await api('/users/settings', { method: 'PATCH', body: data });
  return res.data;
}

export async function fetchBadges() {
  const res = await api('/users/badges');
  return res.data;
}

export async function exportUserData() {
  const res = await api('/users/export');
  return res.data;
}

export async function deleteAccount() {
  await api('/users/account', { method: 'DELETE' });
}
