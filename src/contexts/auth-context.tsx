'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential, sendPasswordResetEmail, type User as FirebaseUser, deleteUser } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User, BulkUserCreationData } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { checkApartmentExists } from '@/lib/services/user-service';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  registerAdmin: (name: string, buildingName: string, email: string, password: string) => Promise<void>;
  createUserWithRole: (details: {name: string, email: string, phone: string, password: string, role: User['role'], apartment?: string}, adminPassword: string) => Promise<boolean>;
  deleteResident: (userToDelete: User, adminPassword: string) => Promise<boolean>;
  createResidentsInBulk: (users: BulkUserCreationData[], adminPassword: string, onProgress: (count: number) => void) => Promise<{success: number, failed: number}>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  reauthenticate: (password: string) => Promise<boolean>;
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
        phone: '',
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

 const createUserWithRole = useCallback(async (
    details: { name: string, email: string, phone: string, password: string, role: User['role'], apartment?: string },
    adminPassword: string
): Promise<boolean> => {
    const { name, apartment, email, phone, password, role } = details;
    if (!currentUser || currentUser.role !== 'admin' || !currentUser.buildingName || !currentUser.email) {
        toast({ variant: "destructive", title: "Lỗi", description: "Bạn không có quyền thực hiện hành động này." });
        return false;
    }
    
    const adminEmail = currentUser.email;
    const buildingName = currentUser.buildingName;

    /*
    // Temporarily disable duplicate check
    if(role === 'resident' && apartment) {
        const apartmentExists = await checkApartmentExists(buildingName, apartment);
        if (apartmentExists) {
            toast({
                variant: "destructive",
                title: "Thông tin bị trùng",
                description: "Căn hộ đó đã tồn tại.",
            });
            return false;
        }
    }
    */


    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        const newUserDoc: Omit<User, 'uid'> = {
            name,
            email,
            phone,
            role,
            buildingName: buildingName,
            ...(role === 'resident' && { apartment }),
        };
        await setDoc(doc(db, "users", newUser.uid), newUserDoc);
        
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        
        if (auth.currentUser) {
            await handleUserAuth(auth.currentUser);
        }

        toast({
            title: "Tạo tài khoản thành công!",
            description: `Đã tạo tài khoản cho ${name}.`,
        });
        return true;
    } catch (error: any) {
        console.error("Error at createUserWithRole:", error);
        toast({
            variant: "destructive",
            title: "Lỗi tạo tài khoản",
            description: error.code === 'auth/email-already-in-use' ? 'Email này đã được sử dụng.' : "Không thể tạo người dùng. Vui lòng thử lại.",
        });
        
        try {
            await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
             if (auth.currentUser) {
              await handleUserAuth(auth.currentUser);
            }
        } catch (reauthError) {
             console.error("CRITICAL: Failed to sign admin back in after user creation failure:", reauthError);
             router.push('/login');
        }
        return false;
    }
}, [currentUser, toast, router, handleUserAuth]);


  const createResidentsInBulk = useCallback(async (users: BulkUserCreationData[], adminPassword: string, onProgress: (count: number) => void) => {
      if (!currentUser || !currentUser.email || !currentUser.buildingName) {
          toast({ variant: "destructive", title: "Lỗi", description: "Bạn không có quyền thực hiện hành động này." });
          return { success: 0, failed: 0 };
      }
      
      const adminEmail = currentUser.email;
      const buildingName = currentUser.buildingName;
      
      let successCount = 0;
      let failedCount = 0;
      const failedUsers: string[] = [];

      for (let i = 0; i < users.length; i++) {
          const user = users[i];
          try {
              const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
              const newResidentUser = userCredential.user;

              const newUserDoc: Omit<User, 'uid'> = {
                  name: user.name,
                  email: user.email,
                  phone: user.phone,
                  role: 'resident',
                  apartment: user.apartment,
                  buildingName: buildingName,
              };
              await setDoc(doc(db, "users", newResidentUser.uid), newUserDoc);
              successCount++;
          } catch (error: any) {
              console.error(`Failed to create user ${user.email}:`, error);
              failedCount++;
              failedUsers.push(`${user.email} (Lỗi: ${error.code})`);
          } finally {
             onProgress(i + 1);
          }
      }
      
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      if (auth.currentUser) {
        await handleUserAuth(auth.currentUser);
      }

      if(failedCount > 0) {
        console.error("Failed to create the following users:", failedUsers);
      }

      return { success: successCount, failed: failedCount };
  }, [currentUser, toast, handleUserAuth]);

    const deleteResident = useCallback(async (userToDelete: User, adminPassword: string): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'admin' || !currentUser.email) {
      toast({ variant: "destructive", title: "Lỗi", description: "Bạn không có quyền thực hiện hành động này." });
      return false;
    }

    const adminEmail = currentUser.email;

    try {
      // Step 1: Delete user from Firestore
      await deleteDoc(doc(db, 'users', userToDelete.uid));

      // Step 2: In a real app, you would call a backend function to delete the user from Firebase Auth
      // For this prototype, we'll log a message. Direct client-side user deletion is not recommended.
      console.log(`Sent request to backend to delete user ${userToDelete.uid} from Firebase Auth.`);

      // Step 3: Sign the admin back in
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      if (auth.currentUser) {
        await handleUserAuth(auth.currentUser);
      }

      return true;
    } catch (error: any) {
      console.error("Error deleting resident:", error);
      toast({ variant: "destructive", title: "Lỗi", description: "Xóa tài khoản không thành công." });
      
      // Attempt to sign admin back in even if deletion fails
      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      } catch (reauthError) {
        console.error("CRITICAL: Failed to sign admin back in after deletion failure:", reauthError);
        router.push('/login');
      }

      return false;
    }
  }, [currentUser, router, toast, handleUserAuth]);


  const reauthenticate = useCallback(async (password: string): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user || !user.email) {
        toast({ variant: "destructive", title: "Lỗi", description: "Không tìm thấy người dùng." });
        return false;
    }
    const credential = EmailAuthProvider.credential(user.email, password);
    try {
        await reauthenticateWithCredential(user, credential);
        toast({ title: "Xác thực thành công!", description: "Bạn có thể tiếp tục hành động." });
        return true;
    } catch (error) {
        toast({ variant: "destructive", title: "Xác thực thất bại", description: "Mật khẩu không chính xác." });
        return false;
    }
  }, [toast]);

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
    <AuthContext.Provider value={{ currentUser, loading, registerAdmin, createUserWithRole, deleteResident, createResidentsInBulk, login, logout, changeUserPassword, resetPassword, reauthenticate }}>
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
