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

interface AddUserDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onFormSubmit: (data: any) => void;
}

export function AddUserDialog({ isOpen, onOpenChange, onFormSubmit }: AddUserDialogProps) {
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [apartment, setApartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setApartment('');
    setEmail('');
    setPhone('');
    setPassword('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        toast({
            variant: "destructive",
            title: "Mật khẩu không hợp lệ",
            description: "Mật khẩu phải có ít nhất 6 ký tự.",
        });
        return;
    }
    
    // Pass data up to the parent to handle re-authentication
    onFormSubmit({ name, apartment, email, phone, password });
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
            <DialogTitle>Thêm tài khoản Cư dân</DialogTitle>
            <DialogDescription>
                Tạo một tài khoản mới cho cư dân. Họ có thể đổi mật khẩu sau khi đăng nhập lần đầu.
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
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu tạm thời</Label>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
                </div>
            </div>
            <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo tài khoản
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
