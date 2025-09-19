
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Notification } from '@/lib/types';
import { getNotifications } from '@/lib/services/notification-service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, Loader2 } from 'lucide-react';
import { NotificationItem } from '../notifications/notification-item';


export function RecentNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.buildingName) return;

    const fetchNotifications = async () => {
        setLoading(true);
        const fetchedNotifications = await getNotifications({ 
            buildingName: currentUser.buildingName,
            role: currentUser.role,
            take: 3
        });
        
        // No need to sort, already sorted by query
        setNotifications(fetchedNotifications);
        setLoading(false);
    };
    fetchNotifications();
  }, [currentUser]);


  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-lg">
                <Bell className="w-5 h-5 text-accent" />
            </div>
            <CardTitle className="text-lg font-headline">Thông báo gần đây</CardTitle>
        </div>
        <Button asChild variant="ghost" size="sm">
            <Link href="/notifications">Xem tất cả</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex items-center justify-center h-24">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        ) : notifications.length > 0 ? (
            <div className="space-y-4">
            {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
            ))}
            </div>
        ) : (
            <p className="text-center text-muted-foreground">Không có thông báo nào gần đây.</p>
        )}
      </CardContent>
    </Card>
  );
}
