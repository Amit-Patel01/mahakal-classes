'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  avatarFileId?: string;
  studentProfile?: {
    enrollmentNumber: string;
    academicGoal?: string;
    course?: { id: string; title: string; code: string };
  };
  teacherProfile?: {
    designation: string;
    qualification: string;
    experienceYears: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Rehydrate session from localStorage on client mount
    const savedToken = localStorage.getItem('mc_access_token');
    const savedUser = localStorage.getItem('mc_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('mc_access_token');
        localStorage.removeItem('mc_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User, refreshToken?: string) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('mc_access_token', newToken);
    localStorage.setItem('mc_user', JSON.stringify(newUser));
    if (refreshToken) {
      localStorage.setItem('mc_refresh_token', refreshToken);
    }

    // Role-based automatic redirect
    if (newUser.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else if (newUser.role === 'TEACHER') {
      router.push('/teacher/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mc_access_token');
    localStorage.removeItem('mc_refresh_token');
    localStorage.removeItem('mc_user');
    router.push('/login');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('mc_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
