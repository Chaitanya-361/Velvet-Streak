const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

export async function api<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!skipAuth && accessToken) {
    finalHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // for refresh token cookie
  });

  const json = await res.json();

  if (!res.ok) {
    // Try refresh if 401
    if (res.status === 401 && !skipAuth && !endpoint.includes('/refresh')) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry original request
        return api<T>(endpoint, options);
      }
    }
    throw new ApiError(json.error?.code || 'UNKNOWN', res.status, json.error?.message || 'Request failed', json.error?.details);
  }

  return json;
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return false;

    const json = await res.json();
    if (json.data?.accessToken) {
      setAccessToken(json.data.accessToken);
      localStorage.setItem('vs_access_token', json.data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: { field: string; issue: string }[];

  constructor(
    code: string,
    statusCode: number,
    message: string,
    details?: { field: string; issue: string }[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
