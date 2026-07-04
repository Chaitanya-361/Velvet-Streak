import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, setAccessToken } from '../api/client';

interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  xp: number;
  level: number;
  preferences: {
    timezone: string;
    dayBoundaryTime: string;
    weekStartDay: 'MON' | 'SUN';
  };
  badgesEarned: { badgeKey: string; earnedAt: string }[];
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem('vs_access_token');
    if (stored) {
      setAccessToken(stored);
      fetchMe().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchMe = async () => {
    try {
      const res = await api<{ data: User }>('/auth/me');
      setUser(res.data);
    } catch {
      // Token expired or invalid — try refresh
      try {
        const refreshRes = await api<{ data: { accessToken: string } }>('/auth/refresh', { method: 'POST', skipAuth: true });
        if (refreshRes.data.accessToken) {
          setAccessToken(refreshRes.data.accessToken);
          localStorage.setItem('vs_access_token', refreshRes.data.accessToken);
          const meRes = await api<{ data: User }>('/auth/me');
          setUser(meRes.data);
        }
      } catch {
        // Fully logged out
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('vs_access_token');
      }
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ data: { user: User; accessToken: string } }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    });
    setAccessToken(res.data.accessToken);
    localStorage.setItem('vs_access_token', res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string, displayName: string) => {
    const res = await api<{ data: { user: User; accessToken: string } }>('/auth/register', {
      method: 'POST',
      body: { email, username, password, displayName },
      skipAuth: true,
    });
    setAccessToken(res.data.accessToken);
    localStorage.setItem('vs_access_token', res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('vs_access_token');
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
