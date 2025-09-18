'use client';
import { AuthGuardLayout } from '@/components/layout/auth-guard-layout';

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuardLayout allowedRoles={['admin', 'resident', 'technician']}>
      {children}
    </AuthGuardLayout>
  );
}
