'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail, type User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, BulkUserCreationData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  registerAdmin: (name: string, buildingName: string, email: string, password: string) => Promise<void>;
  createResident: (name: string, apartment: string, email: string, password: string) => Promise<boolean>;
  createResidentsInBulk: (users: BulkUserCreationData[], onProgress: (count: number) => void) => Promise<{success: number, failed: number}>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

   const handleUserAuth = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = { uid: firebaseUser.uid, ...userDoc.data() } as User;
        setCurrentUser(userData);
      } else {
        // This case might happen if user is deleted from Firestore but not Auth
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUserAuth);
    return () => unsubscribe();
  }, [handleUserAuth]);

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
    
    // We cannot just use `auth.currentUser` as it might be null or different
    // when this function is called in a loop for bulk creation.
    // Instead, we will create a temporary auth instance for creating users
    // and then sign back in as the admin. This is a common pattern for admin actions.
    // However, for simplicity and since Firebase Admin SDK is not used on client,
    // we'll rely on the fact that creating a user doesn't sign the admin out immediately.
    // A more robust solution would use Cloud Functions.

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newResidentUser = userCredential.user;

        const newUserDoc: Omit<User, 'uid'> = {
            name,
            email,
            role: 'resident',
            apartment,
            buildingName: currentUser.buildingName,
        };
        await setDoc(doc(db, "users", newResidentUser.uid), newUserDoc);
        
        toast({
            title: "Thành công!",
            description: `Đã tạo tài khoản cho cư dân ${name} ở căn hộ ${apartment}.`,
        });

        return true;

    } catch (error: any) {
        console.error("Error creating resident:", error);
        
        toast({
            variant: "destructive",
            title: "Lỗi tạo tài khoản",
            description: `Không thể tạo tài khoản cho ${email}: ${error.code === 'auth/email-already-in-use' ? 'Email đã được sử dụng.' : 'Lỗi không xác định.'}`,
        });
        return false;
    }
}, [currentUser, toast]);


  const createResidentsInBulk = useCallback(async (users: BulkUserCreationData[], onProgress: (count: number) => void) => {
      if (!currentUser || !currentUser.email) {
          toast({ variant: "destructive", title: "Lỗi", description: "Bạn không có quyền thực hiện hành động này." });
          return { success: 0, failed: 0 };
      }
      
      const adminEmail = currentUser.email;
      const adminPassword = prompt("Để xác nhận hành động này, vui lòng nhập lại mật khẩu của bạn:");

      if (!adminPassword) {
          toast({ variant: "destructive", title: "Hủy bỏ", description: "Hành động đã bị hủy." });
          return { success: 0, failed: 0 };
      }

      try {
          const credential = EmailAuthProvider.credential(adminEmail, adminPassword);
          await reauthenticateWithCredential(auth.currentUser!, credential);
      } catch (error) {
          toast({ variant: "destructive", title: "Xác thực thất bại", description: "Mật khẩu không chính xác. Hành động đã bị hủy." });
          return { success: 0, failed: 0 };
      }

      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < users.length; i++) {
          const user = users[i];
          try {
              const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
              const newResidentUser = userCredential.user;

              const newUserDoc: Omit<User, 'uid'> = {
                  name: user.name,
                  email: user.email,
                  role: 'resident',
                  apartment: user.apartment,
                  buildingName: currentUser.buildingName,
              };
              await setDoc(doc(db, "users", newResidentUser.uid), newUserDoc);
              successCount++;
          } catch (error: any) {
              console.error(`Failed to create user ${user.email}:`, error);
              failedCount++;
          } finally {
              // Always sign the admin back in
              try {
                  await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
              } catch (reauthError) {
                  console.error("CRITICAL: Failed to sign admin back in:", reauthError);
                  toast({
                      variant: "destructive",
                      title: "Lỗi nghiêm trọng",
                      description: "Không thể đăng nhập lại tài khoản quản trị viên. Vui lòng đăng nhập lại thủ công.",
                  });
                  window.location.assign('/login');
                  return { success: successCount, failed: failedCount };
              }
              onProgress(i + 1);
          }
      }

      return { success: successCount, failed: failedCount };
  }, [currentUser, toast]);


  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
  }, [toast]);


  const logout = useCallback(async () => {
    try {
      await signOut(auth);
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

  const changeUserPassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không tìm thấy người dùng." });
      return false;
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast({ title: "Thành công", description: "Mật khẩu của bạn đã được thay đổi." });
      return true;
    } catch (error: any) {
      console.error("Error changing password:", error);
      let description = "Đã có lỗi xảy ra.";
      if (error.code === 'auth/wrong-password') {
        description = "Mật khẩu hiện tại không chính xác.";
      } else if (error.code === 'auth/weak-password') {
        description = "Mật khẩu mới quá yếu. Vui lòng chọn mật khẩu khác mạnh hơn.";
      }
      toast({ variant: "destructive", title: "Đổi mật khẩu thất bại", description });
      return false;
    }
  }, [toast]);
  
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
        await sendPasswordResetEmail(auth, email);
        toast({
            title: "Kiểm tra email của bạn",
            description: `Một liên kết đặt lại mật khẩu đã được gửi đến ${email}.`,
        });
        return true;
    } catch (error: any) {
        console.error("Error sending password reset email:", error);
        let description = "Đã có lỗi xảy ra. Vui lòng thử lại.";
        if (error.code === 'auth/user-not-found') {
            description = "Không tìm thấy tài khoản nào với địa chỉ email này.";
        }
        toast({
            variant: "destructive",
            title: "Gửi email thất bại",
            description,
        });
        return false;
    }
  }, [toast]);


  return (
    <AuthContext.Provider value={{ currentUser, loading, registerAdmin, createResident, createResidentsInBulk, login, logout, changeUserPassword, resetPassword }}>
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
