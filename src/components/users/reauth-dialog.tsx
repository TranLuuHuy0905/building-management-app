'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface ReauthDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onReauthSuccess: (password: string) => void;
}

export function ReauthDialog({ isOpen, onOpenChange, onReauthSuccess }: ReauthDialogProps) {
  const { reauthenticate } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await reauthenticate(password);
    setIsSubmitting(false);

    if (success) {
      onReauthSuccess(password);
      setPassword('');
      onOpenChange(false);
    }
  };

  const handleClose = (open: boolean) => {
      if (!isSubmitting) {
          setPassword('');
          onOpenChange(open);
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Xác thực lại</DialogTitle>
                <DialogDescription>
                    Để tiếp tục hành động này, vui lòng nhập lại mật khẩu của bạn.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Hành động nhạy cảm</AlertTitle>
                    <AlertDescription>
                        Bạn đang chuẩn bị thực hiện một hành động quan trọng.
                    </AlertDescription>
                </Alert>

                <div className="space-y-2">
                    <Label htmlFor="reauth-password">Mật khẩu</Label>
                    <Input 
                        id="reauth-password" 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => handleClose(false)} disabled={isSubmitting}>Hủy</Button>
                <Button type="submit" disabled={isSubmitting || !password}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Xác nhận
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    