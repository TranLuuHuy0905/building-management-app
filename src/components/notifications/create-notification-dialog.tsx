'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Notification } from '@/lib/types';
import { createAndSendNotification } from '@/lib/services/notification-service';
import { useAuth } from '@/contexts/auth-context';

interface CreateNotificationDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onNotificationCreated: () => void;
}

export function CreateNotificationDialog({ isOpen, onOpenChange, onNotificationCreated }: CreateNotificationDialogProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<Notification['type']>('event');
  const [targetType, setTargetType] = useState<Notification['targetType']>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setType('event');
    setTargetType('all');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.buildingName) {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể xác định tòa nhà.' });
        return;
    }
    
    setIsSubmitting(true);
    
    const notificationData: Omit<Notification, 'id' | 'date'> = {
        title,
        content,
        type,
        targetType,
        buildingName: currentUser.buildingName,
    };

    const result = await createAndSendNotification(notificationData as Omit<Notification, 'id'>);
    setIsSubmitting(false);

    if (result.newNotificationId) {
        toast({ 
          title: 'Gửi thành công!', 
          description: `Đã gửi thông báo đẩy đến ${result.success} thiết bị. Thất bại: ${result.failed}.` 
        });
        onNotificationCreated();
        onOpenChange(false);
        resetForm();
    } else {
        toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể gửi thông báo. Vui lòng thử lại.' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Tạo thông báo mới</DialogTitle>
                <DialogDescription>
                    Soạn và gửi thông báo đến các thành viên trong tòa nhà.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="content">Nội dung</Label>
                    <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Loại thông báo</Label>
                         <Select value={type} onValueChange={(value: Notification['type']) => setType(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="event">Sự kiện</SelectItem>
                                <SelectItem value="warning">Cảnh báo</SelectItem>
                                <SelectItem value="reminder">Nhắc nhở</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Đối tượng</Label>
                         <Select value={targetType} onValueChange={(value: Notification['targetType']) => setTargetType(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn đối tượng" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="resident">Cư dân</SelectItem>
                                <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Hủy</Button>
                <Button type="submit" disabled={isSubmitting || !title || !content}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Gửi thông báo
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
