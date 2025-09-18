'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { NotificationItem } from './notification-item';
import type { Notification } from '@/lib/types';
import { getNotifications, deleteNotification } from '@/lib/services/notification-service';
import { CreateNotificationDialog } from './create-notification-dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

export function NotificationList() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.buildingName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // Pass the user's role to the service for server-side filtering.
    const fetchedNotifications = await getNotifications({ 
        buildingName: currentUser.buildingName,
        role: currentUser.role 
    });
    
    // No more client-side filtering needed. The server does the work.
    setNotifications(fetchedNotifications);
    setLoading(false);
  }, [currentUser?.buildingName, currentUser?.role]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleOpenDeleteDialog = (id: string) => {
    setNotificationToDelete(id);
    setIsDeleteDialogOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;
    
    const success = await deleteNotification(notificationToDelete);
    if(success) {
      toast({ title: "Thành công", description: "Đã xóa thông báo." });
      setNotifications(prev => prev.filter(n => n.id !== notificationToDelete));
    } else {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể xóa thông báo." });
    }
    
    setIsDeleteDialogOpen(false);
    setNotificationToDelete(null);
  }
  
  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-headline">Thông báo</h2>
          {currentUser?.role === 'admin' && (
            <Button size="icon" onClick={() => setIsCreateDialogOpen(true)}>
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
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onDelete={currentUser?.role === 'admin' ? handleOpenDeleteDialog : undefined}
                  />
              ))
          ) : (
              <p className="text-center text-muted-foreground pt-10">Không có thông báo nào.</p>
          )}
        </div>
      </div>

      <CreateNotificationDialog 
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onNotificationCreated={fetchNotifications}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể được hoàn tác. Thông báo này sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Xác nhận Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
