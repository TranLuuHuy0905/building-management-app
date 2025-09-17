'use client';

import { useAuth } from '@/contexts/auth-context';
import type { User } from '@/lib/types';
import { LogOut, Building2, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function AppHeader({ user }: { user: User }) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm shadow-sm border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
                <h1 className="text-lg font-bold text-gray-800 font-headline">{user.buildingName || 'Building Buddy'}</h1>
                <p className="text-xs text-gray-600">
                Xin chào, {user.name}
                {user.apartment && ` - ${user.apartment}`}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="Hồ sơ">
                <Link href="/profile">
                    <UserCog className="w-5 h-5" />
                </Link>
            </Button>
            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </Button>
        </div>
      </div>
    </header>
  );
}
