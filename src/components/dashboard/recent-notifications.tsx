import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Notification } from '@/lib/types';
import { getNotifications } from '@/lib/services/notification-service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { NotificationItem } from '../notifications/notification-item';
import { getCurrentUser } from '@/lib/services/get-current-user';

export async function RecentNotifications() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser?.buildingName || !currentUser.role) {
    return null; // Or a skeleton/loading state
  }

  const notifications = await getNotifications({ 
      buildingName: currentUser.buildingName,
      role: currentUser.role,
      take: 3
  });

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
        {notifications.length > 0 ? (
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
