'use client';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

const SHARED_ROUTES = ['/notifications'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/login');
    }

    if (!loading && currentUser) {
      // Redirect to role-specific homepage if they land on a generic path
      const currentRouteRole = pathname.split('/')[1]; // e.g., 'admin' or 'resident'
      const userRouteRole = currentUser.role === 'admin' ? 'admin' : 'resident';

      // Allow access to shared routes
      if (SHARED_ROUTES.some(route => pathname.startsWith(route))) {
        return;
      }

      if (currentUser.role === 'technician' && pathname.startsWith('/requests')) {
        return;
      }
      
      // If user is on a page not matching their role, redirect them
      if (currentRouteRole !== userRouteRole && userRouteRole) {
         router.replace(`/${userRouteRole}/home`);
      }
    }
  }, [currentUser, loading, router, pathname]);

  if (loading || !currentUser) {
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
