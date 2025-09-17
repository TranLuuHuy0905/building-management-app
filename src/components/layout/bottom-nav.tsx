'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bell, Wrench, CreditCard, Users } from 'lucide-react';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

export function BottomNav({ user }: { user: User }) {
  const pathname = usePathname();

  let navItems = [
    { href: '/home', icon: Home, label: 'Trang chủ' },
    { href: '/notifications', icon: Bell, label: 'Thông báo' },
    {
      href: '/requests',
      icon: Wrench,
      label:
        user.role === 'resident'
          ? 'Phản ánh'
          : user.role === 'technician'
          ? 'Nhiệm vụ'
          : 'Phản ánh',
    },
    {
      href: '/bills',
      icon: CreditCard,
      label: user.role === 'admin' ? 'Thu phí' : 'Thanh toán',
    },
  ];

  if (user.role === 'admin') {
    navItems.push({ href: '/users', icon: Users, label: 'Thành viên'});
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto grid grid-cols-5 items-center justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center p-2 rounded-lg transition-colors duration-200',
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
