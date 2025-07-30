'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAccessToken,
  clearTokens,
  refreshAccessToken,
  getTokenType,
} from '@/lib/token-service';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client' | 'coach';
  token?: string;
  profileImage?: string;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    role?: string,
  ) => Promise<{ success: boolean; needsPasswordSetup?: boolean }>;
  setupPassword: (
    password: string,
    confirmPassword: string,
  ) => Promise<{ success: boolean }>;
  loginWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean }>;
  logout: () => void;
  getToken: () => { token: string | null; tokenType: string | null };
  getAuthorizationHeader: () => string | null;
  refreshToken: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for saved auth state
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  const getToken = (): { token: string | null; tokenType: string | null } => {
    const token = getAccessToken();
    const tokenType = getTokenType();
    return { token, tokenType };
  };

  const login = async (email: string, role?: string) => {
    setIsLoading(true);
    return { success: false, needsPasswordSetup: false };
  };

  const setupPassword = async (password: string, confirmPassword: string) => {
    setIsLoading(true);
    return { success: false };
  };

  const loginWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    return { success: false };
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    return { success: false };
  };

  const logout = () => {
    setUser(null);
    clearTokens();
    router.push('/');
  };

  const getAuthorizationHeader = (): string | null => {
    return getAuthorizationHeader();
  };

  const refreshToken = async (): Promise<boolean> => {
    return await refreshAccessToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        setupPassword,
        loginWithPassword,
        resetPassword,
        logout,
        getToken,
        getAuthorizationHeader,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
