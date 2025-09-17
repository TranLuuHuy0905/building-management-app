'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"


interface AuthContextType {
  currentUser: User | null;
  registerAdmin: (name: string, phone: string, otp: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  const registerAdmin = useCallback((name: string, phone: string, otp: string) => {
    // In a real app, you would verify the OTP with a backend service.
    // For this demo, we'll use a static OTP.
    if (otp === '123456') {
      const newAdmin: User = {
        name,
        phone,
        role: 'admin',
        id: `admin_${Date.now()}`
      };
      setCurrentUser(newAdmin);
      localStorage.setItem('currentUser', JSON.stringify(newAdmin));
      // In a real app, you would save the new user to your database.
      
      // We'll also update the mock users object for this session,
      // so other features can see this new user.
      // This part is for demonstration purposes.
      try {
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[phone] = { role: 'admin', name: newAdmin.name, id: newAdmin.id };
        localStorage.setItem('users', JSON.stringify(users));
      } catch (e) {
        // ignore
      }


      router.push('/home');
      toast({
        title: "Thành công!",
        description: "Tài khoản quản lý của bạn đã được tạo.",
      })
    } else {
        toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Mã OTP không chính xác.",
        })
    }
  }, [router, toast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    // We could also clear the session's user data
    // localStorage.removeItem('users');
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ currentUser, registerAdmin, logout, loading }}>
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
