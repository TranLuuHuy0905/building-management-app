'use client';
import { AuthGuardLayout } from '@/components/layout/auth-guard-layout';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuardLayout allowedRoles={['admin', 'resident', 'technician']}>
      {children}
    </AuthGuardLayout>
  );
}
