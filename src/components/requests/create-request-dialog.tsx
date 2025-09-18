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
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Request } from '@/lib/types';

interface CreateRequestDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onFormSubmit: (data: Omit<Request, 'id' | 'apartment' | 'status' | 'createdBy' | 'assignedTo' | 'createdAt' | 'buildingName'>) => void;
}

export function CreateRequestDialog({ isOpen, onOpenChange, onFormSubmit }: CreateRequestDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Request['type']>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('other');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Call the parent form submission handler
    onFormSubmit({ title, description, type });
    // The parent component is now responsible for closing the dialog and showing toast
    // This component only manages its internal state.
    setIsSubmitting(false);
    resetForm();
  };

  const handleOpenChange = (open: boolean) => {
    if (!isSubmitting) {
        onOpenChange(open);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Tạo phản ánh mới</DialogTitle>
                <DialogDescription>
                    Mô tả chi tiết sự cố bạn đang gặp phải. Chúng tôi sẽ xử lý sớm nhất có thể.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="type">Loại sự cố</Label>
                     <Select value={type} onValueChange={(value: Request['type']) => setType(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn loại sự cố" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="electric">Sự cố về Điện</SelectItem>
                            <SelectItem value="water">Sự cố về Nước</SelectItem>
                            <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ví dụ: Vòi nước bị rò rỉ" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Mô tả chi tiết</Label>
                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Mô tả cụ thể vị trí, tình trạng sự cố..." />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Hủy</Button>
                <Button type="submit" disabled={isSubmitting || !title || !description}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Gửi phản ánh
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
