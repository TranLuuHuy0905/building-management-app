'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { NotificationItem } from './notification-item';
import type { Notification } from '@/lib/types';
import { getNotifications } from '@/lib/services/notification-service';

export function NotificationList() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.buildingName) return;
    const fetchNotifications = async () => {
        setLoading(true);
        const fetchedNotifications = await getNotifications({ buildingName: currentUser.buildingName });
        // TODO: Filter notifications based on targetType and user role
        setNotifications(fetchedNotifications);
        setLoading(false);
    };
    fetchNotifications();
  }, [currentUser]);
  
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
        {loading ? (
            <div className="flex items-center justify-center pt-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : notifications.length > 0 ? (
            notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
            ))
        ) : (
             <p className="text-center text-muted-foreground pt-10">Không có thông báo nào.</p>
        )}
      </div>
    </div>
  );
}

    