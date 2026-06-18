import { useState, useEffect } from 'react';
import { type UserProfile } from '../types/api';
import * as authService from '../services/authService';
import { TOKEN_KEY } from '../services/httpClient';

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<UserProfile | null>(null);
  // Lazy init: read localStorage once so the effect needs no synchronous setState
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState<boolean>(() => Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) return; // loading already false from lazy init
    authService
      .me()
      .then((profile) => {
        setUser(profile);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const auth = await authService.login(email, password);
    setToken(auth.token);
    const profile = await authService.me();
    setUser(profile);
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ): Promise<void> => {
    const auth = await authService.register(email, username, password);
    setToken(auth.token);
    const profile = await authService.me();
    setUser(profile);
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const profile = await authService.me();
      setUser(profile);
    } catch {
      // silently ignore — token may have expired
    }
  };

  return {
    user,
    token,
    loading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    refreshUser,
  };
}
