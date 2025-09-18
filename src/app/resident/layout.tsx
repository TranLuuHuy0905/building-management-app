'use client';
import { AuthGuardLayout } from '@/components/layout/auth-guard-layout';

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuardLayout allowedRoles={['resident']}>
      {children}
    </AuthGuardLayout>
  );
}
