'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Bell, Wrench, CreditCard, Users, Construction } from 'lucide-react';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';


export function BottomNav({ user }: { user: User }) {
  const pathname = usePathname();

  const getNavItems = () => {
    const adminItems = [
      { href: `/admin/home`, icon: Home, label: 'Trang chủ' },
      { href: '/notifications', icon: Bell, label: 'Thông báo' },
      { href: `/admin/requests`, icon: Wrench, label: 'Phản ánh' },
      { href: `/admin/bills`, icon: CreditCard, label: 'Thu phí' },
      { href: `/admin/users`, icon: Users, label: 'Thành viên' },
    ];
    
    const residentItems = [
      { href: `/resident/home`, icon: Home, label: 'Trang chủ' },
      { href: '/notifications', icon: Bell, label: 'Thông báo' },
      { href: `/resident/requests`, icon: Wrench, label: 'Phản ánh' },
      { href: `/resident/bills`, icon: CreditCard, label: 'Hóa đơn' },
    ];

     const technicianItems = [
        { href: `/technician/home`, icon: Home, label: 'Trang chủ' },
        { href: `/technician/requests`, icon: Construction, label: 'Nhiệm vụ' },
        { href: `/notifications`, icon: Bell, label: 'Thông báo' },
    ];


    switch(user.role) {
      case 'admin': return adminItems;
      case 'resident': return residentItems;
      case 'technician': return technicianItems;
      default: return [];
    }
  }

  const navItems = getNavItems();
  const gridColsClass = `grid-cols-${navItems.length}`;


  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.1)]">
      <div className={cn("container mx-auto grid items-center justify-around py-2", gridColsClass)}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center p-2 rounded-lg transition-colors duration-200',
              // Check if the current path starts with the item's href. 
              // This handles nested routes correctly.
              pathname.startsWith(item.href)
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
