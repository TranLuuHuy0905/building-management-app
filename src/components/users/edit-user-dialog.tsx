'use client';
import { useState, useEffect } from 'react';
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
import type { User } from '@/lib/types';

interface EditUserDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    user: User;
    onFormSubmit: (data: Partial<User>) => void;
}

export function EditUserDialog({ isOpen, onOpenChange, user, onFormSubmit }: EditUserDialogProps) {
  const [name, setName] = useState('');
  const [apartment, setApartment] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setApartment(user.apartment || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onFormSubmit({ name, apartment, phone });
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin Cư dân</DialogTitle>
            <DialogDescription>
                Cập nhật thông tin cho tài khoản <span className="font-bold">{user.email}</span>.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Tên cư dân</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="apartment">Số căn hộ</Label>
                    <Input id="apartment" value={apartment} onChange={e => setApartment(e.target.value)} placeholder="Ví dụ: P-101" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Hủy</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Lưu thay đổi
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
