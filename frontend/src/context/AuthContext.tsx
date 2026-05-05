import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sbs_token');
    const storedUser = localStorage.getItem('sbs_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch { }
    }
    setLoading(false);
  }, []);

  function persist(token: string, u: User) {
    localStorage.setItem('sbs_token', token);
    localStorage.setItem('sbs_user', JSON.stringify(u));
    setUser(u);
  }

  async function login(email: string, password: string) {
    const { token, user: u } = await authApi.login(email, password);
    persist(token, u);
  }

  async function register(email: string, password: string, name: string) {
    const { token, user: u } = await authApi.register(email, password, name);
    persist(token, u);
  }

  async function logout() {
    try { await authApi.logout(); } catch { }
    localStorage.removeItem('sbs_token');
    localStorage.removeItem('sbs_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
