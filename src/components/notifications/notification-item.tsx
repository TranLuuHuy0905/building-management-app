'use client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Notification } from '@/lib/types';
import { AlertCircle, Bell, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '@/contexts/auth-context';

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
  isCompact?: boolean;
  onDelete?: (id: string) => void;
}


export function NotificationItem({ notification, isCompact = false, onDelete }: NotificationItemProps) {
  const { currentUser } = useAuth();
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
      // Fallback for invalid date format from old data
      setDate(notification.date);
    }
  }, [notification.date]);

  const canDelete = currentUser?.role === 'admin' && onDelete;

  if (isCompact) {
    return (
        <div className="flex items-start space-x-4 p-3 bg-secondary/50 rounded-lg">
            <div className="pt-1">{getTypeIcon(notification.type)}</div>
            <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                {date && <p className="text-xs text-muted-foreground/80 mt-2">{date}</p>}
            </div>
        </div>
    );
  }

  return (
    <Card className="shadow-sm relative">
      {canDelete && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(notification.id)}
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
