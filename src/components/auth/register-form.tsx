'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const { registerAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrimaryAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showOtpInput) {
        if(name && phone) {
            setShowOtpInput(true);
        }
    } else {
      setIsSubmitting(true);
      registerAdmin(name, phone, otp);
      // No need to set isSubmitting to false, as the page will navigate away on success
    }
  };

  return (
    <form onSubmit={handlePrimaryAction} className="space-y-6">
      {!showOtpInput ? (
        <>
            <div className="space-y-2">
                <Label htmlFor="name">Tên của bạn</Label>
                <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập họ và tên"
                required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                required
                />
            </div>
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-center text-muted-foreground">
            Chúng tôi đã gửi một mã OTP đến số điện thoại {phone}.
          </p>
          <Label htmlFor="otp">Mã OTP (nhập 123456)</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Nhập mã OTP"
            required
            autoFocus
          />
        </div>
      )}

      <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {showOtpInput ? 'Xác nhận & Đăng ký' : 'Tiếp tục'}
      </Button>
    </form>
  );
}
