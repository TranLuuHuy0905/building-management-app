'use client';
import { AuthGuardLayout } from '@/components/layout/auth-guard-layout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuardLayout allowedRoles={['admin']}>
      {children}
    </AuthGuardLayout>
  );
}
