'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api, UserProfile } from '@/lib/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateCoins: (coins: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    if (api.isAuthenticated()) {
      try {
        const profile = await api.getProfile();
        setUser(profile);
      } catch {
        api.logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    await api.login(username, password);
    const profile = await api.getProfile();
    setUser(profile);
  };

  const register = async (username: string, email: string, password: string) => {
    const data = await api.register(username, email, password);
    setUser(data.profile);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    const profile = await api.getProfile();
    setUser(profile);
  };

  const updateCoins = (coins: number) => {
    if (user) {
      setUser({ ...user, coins, is_bankrupt: coins <= 0 });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile, updateCoins }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
