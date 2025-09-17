'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifications } from '@/lib/data';
import { NotificationItem } from '@/components/notifications/notification-item';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export function RecentNotifications() {
  const recentNotifications = notifications.slice(0, 3);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
                <Bell className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-headline">Thông báo mới</CardTitle>
        </div>
        <Button asChild variant="ghost" size="sm">
            <Link href="/notifications">Xem tất cả</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} isCompact={true} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
