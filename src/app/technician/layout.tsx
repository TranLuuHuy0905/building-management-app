'use client';
import { AuthGuardLayout } from '@/components/layout/auth-guard-layout';

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuardLayout allowedRoles={['technician']}>
      {children}
    </AuthGuardLayout>
  );
}
