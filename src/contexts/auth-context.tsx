'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, type User as FirebaseUser, getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  registerAdmin: (name: string, buildingName: string, email: string, password: string) => Promise<void>;
  createResident: (name: string, apartment: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setCurrentUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
        } else {
          // This case might happen if a user is created in Auth but not in Firestore yet
          // or if the doc is deleted.
          const adminCreatingUser = sessionStorage.getItem('adminCreatingUser');
          if (!adminCreatingUser) {
             setCurrentUser(null);
          }
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerAdmin = useCallback(async (name: string, buildingName: string, email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newUser: Omit<User, 'uid'> = {
        name,
        email,
        role: 'admin',
        buildingName,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setCurrentUser({ uid: firebaseUser.uid, ...newUser });
      
      router.push('/home');
      toast({
        title: "Thành công!",
        description: `Tài khoản quản lý cho tòa nhà ${buildingName} đã được tạo.`,
      });
    } catch (error: any) {
      console.error("Error registering admin:", error);
      toast({
        variant: "destructive",
        title: "Lỗi đăng ký",
        description: error.code === 'auth/email-already-in-use' ? 'Email này đã được sử dụng.' : (error.message || "Đã có lỗi xảy ra."),
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

 const createResident = useCallback(async (name: string, apartment: string, email: string, password: string) => {
    if (!currentUser || currentUser.role !== 'admin' || !currentUser.buildingName) {
        toast({ variant: "destructive", title: "Lỗi", description: "Bạn không có quyền thực hiện hành động này." });
        return false;
    }
    
    // In a real-world secure app, this entire logic should be on a server/cloud function.
    // This client-side implementation is a workaround for demonstration purposes.
    const adminEmail = currentUser.email;
    const adminPassword = prompt("Để xác nhận, vui lòng nhập lại mật khẩu Quản lý của bạn:");

    if (!adminPassword) {
      toast({ variant: "destructive", title: "Đã hủy", description: "Hành động tạo người dùng đã bị hủy."});
      return false;
    }

    try {
        // Step 1: Create the new resident user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Step 2: Store resident's details in Firestore
        const newUser: Omit<User, 'uid'> = {
            name,
            email,
            role: 'resident',
            apartment,
            buildingName: currentUser.buildingName,
        };
        await setDoc(doc(db, "users", firebaseUser.uid), newUser);
        
        // Step 3: Sign the admin back in
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

        toast({
            title: "Thành công!",
            description: `Đã tạo tài khoản cho cư dân ${name} ở căn hộ ${apartment}.`,
        });
        return true;

    } catch (error: any) {
        console.error("Error creating resident:", error);

        // Attempt to sign the admin back in case of failure after they were signed out
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword).catch(reauthError => {
            console.error("Failed to re-authenticate admin:", reauthError);
            // If re-authentication fails, the admin is logged out. Redirect to login.
            logout();
        });

        toast({
            variant: "destructive",
            title: "Lỗi tạo tài khoản",
            description: error.code === 'auth/email-already-in-use' ? 'Email này đã được sử dụng.' : "Không thể tạo tài khoản cho cư dân.",
        });
        return false;
    }
}, [currentUser, toast]);


  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/home');
      toast({
        title: "Đăng nhập thành công!",
        description: "Chào mừng bạn đã trở lại.",
      });
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast({
        variant: "destructive",
        title: "Lỗi đăng nhập",
        description: "Email hoặc mật khẩu không đúng.",
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);


  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
       toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đăng xuất không thành công.",
      });
    }
  }, [router, toast]);

  return (
    <AuthContext.Provider value={{ currentUser, loading, registerAdmin, createResident, login, logout }}>
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
