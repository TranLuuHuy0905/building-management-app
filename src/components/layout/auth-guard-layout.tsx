'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { useIsClient } from '@/hooks/use-is-client';

interface AuthGuardLayoutProps {
  children: React.ReactNode;
  allowedRoles: Array<User['role']>;
}

export function AuthGuardLayout({ children, allowedRoles }: AuthGuardLayoutProps) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient || loading) {
      return;
    }

    if (!currentUser) {
      router.replace('/login');
      return;
    }

    if (!allowedRoles.includes(currentUser.role)) {
      // Redirect to the user's correct home page if they land on a wrong page
      router.replace(`/${currentUser.role}/home`);
    }
  }, [currentUser, loading, router, allowedRoles, isClient]);

  // Show loading state on the server, or on the client while auth is loading or if the user is not yet available/authorized
  const showLoading = !isClient || loading || !currentUser || !allowedRoles.includes(currentUser.role);

  if (showLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={currentUser} />
      <main className="pb-24">{children}</main>
      <BottomNav user={currentUser} />
    </div>
  );
}
