'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { users } from '@/lib/data';
import type { User } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"


interface AuthContextType {
  currentUser: User | null;
  login: (phone: string, otp: string) => void;
  logout: () => void;
  loading: boolean;
  isCheckingUser: boolean;
  checkUser: (phone: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from localStorage", error);
      localStorage.removeItem('currentUser');
    }
    setLoading(false);
  }, []);

  const checkUser = (phone: string): boolean => {
    setIsCheckingUser(true);
    const userExists = !!users[phone];
    if (!userExists) {
        toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Số điện thoại không tồn tại trong hệ thống",
        })
    }
    setIsCheckingUser(false);
    return userExists;
  }

  const login = useCallback((phone: string, otp: string) => {
    if (otp === '123456' && users[phone]) {
      const user = { phone, ...users[phone] };
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      router.push('/home');
    } else {
        toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Mã OTP không chính xác",
        })
    }
  }, [router, toast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, isCheckingUser, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
