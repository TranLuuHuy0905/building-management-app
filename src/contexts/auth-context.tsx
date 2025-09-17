'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"


interface AuthContextType {
  currentUser: User | null;
  registerAdmin: (name: string, buildingName: string, username: string, password: string) => Promise<void>;
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

  const registerAdmin = useCallback(async (name: string, buildingName: string, username: string, password: string) => {
    // In a real app, you would perform more robust validation and store the password securely.
    // This is a simplified example.
    if (!name || !buildingName || !username || !password) {
        toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Vui lòng điền đầy đủ thông tin.",
        });
        return;
    }

    const newAdmin: User = {
      name,
      username,
      role: 'admin',
      id: `admin_${Date.now()}`,
      buildingName,
      // Storing password in plaintext is insecure. This is for demo purposes only.
      // In a real application, you MUST hash and salt the password.
      password: password 
    };
    
    setCurrentUser(newAdmin);
    localStorage.setItem('currentUser', JSON.stringify(newAdmin));
    // In a real app, you would save the new user to your database.
    
    router.push('/home');
    toast({
      title: "Thành công!",
      description: `Tài khoản quản lý cho tòa nhà ${buildingName} đã được tạo.`,
    })

  }, [router, toast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
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
