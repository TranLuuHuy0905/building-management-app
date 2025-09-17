'use client';
import { notifications } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { NotificationItem } from './notification-item';

export function NotificationList() {
  const { currentUser } = useAuth();
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-headline">Thông báo</h2>
        {currentUser?.role === 'admin' && (
          <Button size="icon">
            <Plus className="w-5 h-5" />
            <span className="sr-only">Tạo thông báo</span>
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {notifications.map(notification => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
