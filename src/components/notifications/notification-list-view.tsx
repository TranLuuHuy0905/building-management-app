'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { NotificationItem } from './notification-item';
import type { Notification, User } from '@/lib/types';
import { deleteNotification } from '@/lib/services/notification-service';
import { CreateNotificationDialog } from './create-notification-dialog';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface NotificationListViewProps {
    initialNotifications: Notification[];
    user: User;
}

export function NotificationListView({ initialNotifications, user }: NotificationListViewProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  const handleOpenDeleteDialog = (id: string) => {
    setNotificationToDelete(id);
    setIsDeleteDialogOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;
    
    const success = await deleteNotification(notificationToDelete);
    if(success) {
      toast({ title: "Thành công", description: "Đã xóa thông báo." });
      // Instead of client-side filtering, we refresh from server for consistency
      router.refresh();
    } else {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể xóa thông báo." });
    }
    
    setIsDeleteDialogOpen(false);
    setNotificationToDelete(null);
  }

  const onNotificationCreated = () => {
      // Re-fetches data from the server and re-renders the page
      router.refresh();
  }
  
  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-headline">Thông báo</h2>
          {user?.role === 'admin' && (
            <Button size="icon" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-5 h-5" />
              <span className="sr-only">Tạo thông báo</span>
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {initialNotifications.length > 0 ? (
              initialNotifications.map(notification => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    userRole={user.role}
                    onDelete={user?.role === 'admin' ? handleOpenDeleteDialog : undefined}
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
        onNotificationCreated={onNotificationCreated}
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
