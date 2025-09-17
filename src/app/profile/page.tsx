'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { currentUser, changeUserPassword } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu mới và mật khẩu xác nhận không khớp.",
      });
      return;
    }
    if (newPassword.length < 6) {
        toast({
            variant: "destructive",
            title: "Mật khẩu không hợp lệ",
            description: "Mật khẩu mới phải có ít nhất 6 ký tự.",
        });
        return;
    }

    setIsSubmitting(true);
    const success = await changeUserPassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-headline">Hồ sơ của bạn</CardTitle>
          <CardDescription>Xem thông tin tài khoản và thay đổi mật khẩu của bạn tại đây.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tên</Label>
            <Input value={currentUser.name} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={currentUser.email} readOnly disabled />
          </div>
          {currentUser.apartment && (
             <div className="space-y-2">
                <Label>Căn hộ</Label>
                <Input value={currentUser.apartment} readOnly disabled />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-6 border-t">
             <h3 className="text-lg font-semibold">Đổi mật khẩu</h3>
             <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
             </div>
              <CardFooter className="px-0 pb-0">
                  <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Đổi mật khẩu
                  </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
