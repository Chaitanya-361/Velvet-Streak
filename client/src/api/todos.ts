import { api } from './client';
import type { Todo } from '../types';

export async function fetchTodos(params?: Record<string, string>): Promise<Todo[]> {
  const query = params ? `?${new URLSearchParams(params)}` : '';
  const res = await api<{ data: Todo[] }>(`/todos${query}`);
  return res.data;
}

export async function fetchTodo(id: string): Promise<Todo> {
  const res = await api<{ data: Todo }>(`/todos/${id}`);
  return res.data;
}

export async function createTodo(data: Partial<Todo>): Promise<Todo> {
  const res = await api<{ data: Todo }>('/todos', { method: 'POST', body: data });
  return res.data;
}

export async function updateTodo(id: string, data: Partial<Todo>): Promise<Todo> {
  const res = await api<{ data: Todo }>(`/todos/${id}`, { method: 'PATCH', body: data });
  return res.data;
}

export async function deleteTodo(id: string): Promise<void> {
  await api(`/todos/${id}`, { method: 'DELETE' });
}

export async function toggleTodoComplete(id: string): Promise<Todo> {
  const res = await api<{ data: Todo }>(`/todos/${id}/complete`, { method: 'PATCH' });
  return res.data;
}

export async function toggleSubtask(todoId: string, subtaskId: string): Promise<Todo> {
  const res = await api<{ data: Todo }>(`/todos/${todoId}/subtasks/${subtaskId}/toggle`, { method: 'PATCH' });
  return res.data;
}
