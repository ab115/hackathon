/**
 * Authentication Context
 * ──────────────────────
 * Manages user authentication state, token persistence,
 * and handles token-based session restoration on mount.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'STUDENT' | 'ADMIN' | 'JUDGE' | 'MENTOR';
  bio?: string;
  phone?: string;
  college?: string;
  city?: string;
  state?: string;
  profile_image?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string; password: string; full_name: string;
    role: 'STUDENT' | 'ADMIN' | 'JUDGE' | 'MENTOR';
    phone?: string; college?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Restore session from token on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const userData = await userAPI.getCurrentUser();
          if (userData && userData.role) {
            userData.role = userData.role.toUpperCase();
          }
          setUser(userData);
        } catch {
          // Invalid/expired token — clear it
          localStorage.removeItem('auth_token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);  // Only run once on mount

  // Handle global logout events (triggered by 401 interceptor)
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { access_token } = await authAPI.login(email, password);
      localStorage.setItem('auth_token', access_token);
      setToken(access_token);

      const userData = await userAPI.getCurrentUser();
      if (userData && userData.role) {
        userData.role = userData.role.toUpperCase();
      }
      setUser(userData);
    } catch (err: any) {
      const message = err.message || err.response?.data?.detail || 'Login failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: {
    email: string; password: string; full_name: string;
    role: 'STUDENT' | 'ADMIN' | 'JUDGE' | 'MENTOR';
    phone?: string; college?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.register(data);
      // Auto-login after registration
      await login(data.email, data.password);
    } catch (err: any) {
      const message = err.message || err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const userData = await userAPI.getCurrentUser();
      if (userData && userData.role) {
        userData.role = userData.role.toUpperCase();
      }
      setUser(userData);
    } catch {
      setError('Failed to refresh user data.');
    }
  }, [token]);

  const clearError = useCallback(() => setError(null), []);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, isAuthenticated, error,
      login, register, logout, refreshUser, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
