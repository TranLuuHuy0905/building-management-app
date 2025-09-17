'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { registerAdmin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await registerAdmin(name, buildingName, username, password);
    // On failure, isSubmitting should be set to false in the auth context
    // On success, the page will navigate away.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="buildingName">Tên tòa nhà</Label>
          <Input
          id="buildingName"
          type="text"
          value={buildingName}
          onChange={(e) => setBuildingName(e.target.value)}
          placeholder="Ví dụ: Chung cư ABC"
          required
          />
      </div>
      <div className="space-y-2">
          <Label htmlFor="username">Tên đăng nhập</Label>
          <Input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nhập tên đăng nhập"
          required
          />
      </div>
      <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          required
          />
      </div>

      <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Đăng ký
      </Button>
    </form>
  );
}
