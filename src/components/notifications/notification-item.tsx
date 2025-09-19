'use client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Notification, User } from '@/lib/types';
import { AlertCircle, Bell, Clock, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

const getTypeIcon = (type: Notification['type']) => {
  switch (type) {
    case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />;
    case 'event': return <Bell className="w-5 h-5 text-blue-500" />;
    case 'reminder': return <Clock className="w-5 h-5 text-green-500" />;
    default: return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getTypeBadge = (type: Notification['type']) => {
    switch (type) {
        case 'warning': return <Badge variant="destructive">Cảnh báo</Badge>;
        case 'event': return <Badge variant="default">Sự kiện</Badge>;
        case 'reminder': return <Badge variant="secondary">Nhắc nhở</Badge>;
        default: return <Badge variant="outline">Thông báo</Badge>
    }
}

interface NotificationItemProps {
  notification: Notification;
  userRole?: User['role'];
  onDelete?: (id: string) => void;
}


export function NotificationItem({ notification, userRole, onDelete }: NotificationItemProps) {
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    try {
      const formattedDate = new Date(notification.date).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      setDate(formattedDate);
    } catch(e) {
      setDate(notification.date);
    }
  }, [notification.date]);

  const canDelete = userRole === 'admin' && onDelete;

  return (
    <Card className="shadow-sm relative">
      {canDelete && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(notification.id)}
            aria-label="Xóa thông báo"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        <CardHeader>
            <div className="flex items-start space-x-4">
                {getTypeIcon(notification.type)}
                <div className="flex-1">
                    <CardTitle className="text-lg pr-8">{notification.title}</CardTitle>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{notification.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-sm">
            {date && <span className="text-muted-foreground">{date}</span>}
            {getTypeBadge(notification.type)}
        </CardFooter>
    </Card>
  );
}
