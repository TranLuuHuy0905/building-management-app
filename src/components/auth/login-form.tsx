'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const { login, checkUser, isCheckingUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrimaryAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showOtpInput) {
      if (checkUser(phone)) {
        setShowOtpInput(true);
      }
    } else {
      setIsSubmitting(true);
      login(phone, otp);
      // No need to set isSubmitting to false, as the page will navigate away on success
    }
  };

  return (
    <form onSubmit={handlePrimaryAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại"
          disabled={showOtpInput || isCheckingUser}
          required
        />
      </div>

      {showOtpInput && (
        <div className="space-y-2">
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

      <Button type="submit" className="w-full font-semibold" disabled={isCheckingUser || isSubmitting}>
        {(isCheckingUser || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {showOtpInput ? 'Xác nhận OTP' : 'Gửi mã OTP'}
      </Button>
    </form>
  );
}
