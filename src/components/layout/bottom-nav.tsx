'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bell, Wrench, CreditCard, Users, Construction } from 'lucide-react';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';


export function BottomNav({ user }: { user: User }) {
  const pathname = usePathname();

  const getNavItems = () => {
    const baseItems = [
      { href: `/${user.role}/home`, icon: Home, label: 'Trang chủ' },
      { href: '/notifications', icon: Bell, label: 'Thông báo' },
    ];

    const adminItems = [
      ...baseItems,
      { href: `/admin/requests`, icon: Wrench, label: 'Phản ánh' },
      { href: `/admin/bills`, icon: CreditCard, label: 'Thu phí' },
      { href: `/admin/users`, icon: Users, label: 'Thành viên' },
    ];
    
    const residentItems = [
      ...baseItems,
      { href: `/resident/requests`, icon: Wrench, label: 'Phản ánh' },
      { href: `/resident/bills`, icon: CreditCard, label: 'Hóa đơn' },
    ];

     const technicianItems = [
        { href: `/technician/home`, icon: Home, label: 'Trang chủ' },
        { href: `/technician/requests`, icon: Construction, label: 'Nhiệm vụ' },
        { href: '/notifications', icon: Bell, label: 'Thông báo' },
    ];


    switch(user.role) {
      case 'admin': return adminItems;
      case 'resident': return residentItems;
      case 'technician': return technicianItems;
      default: return [];
    }
  }

  const navItems = getNavItems();
  // The grid-cols-x class needs to be generated at build time, so we can't use dynamic values like `grid-cols-${navItems.length}`.
  // We will use a fixed number of columns that works for all roles.
  const gridClass = `grid-cols-${navItems.length}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.1)]">
      <div className={cn("container mx-auto grid items-center justify-around", gridClass)}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center py-2 px-1 rounded-lg transition-colors duration-200',
              (pathname === item.href || (item.href !== `/${user.role}/home` && pathname.startsWith(item.href)))
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
