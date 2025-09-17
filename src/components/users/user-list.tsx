'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, User as UserIcon, Upload } from 'lucide-react';
import type { User } from '@/lib/types';
import { getUsers } from '@/lib/services/user-service';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AddUserDialog } from './add-user-dialog';
import { BulkAddUserDialog } from './bulk-add-user-dialog';

export function UserList() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);

  const fetchUsers = async () => {
      if (!currentUser || !currentUser.buildingName) return;
      setLoading(true);
      const fetchedUsers = await getUsers({ buildingName: currentUser.buildingName });
      setUsers(fetchedUsers.filter(u => u.uid !== currentUser.uid)); // Exclude current admin
      setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const handleUserAdded = () => {
    fetchUsers(); // Re-fetch users after one is added
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-headline">Quản lý Thành viên</h2>
        {currentUser?.role === 'admin' && (
          <div className="flex gap-2">
            <Button onClick={() => setIsBulkAddDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Tạo hàng loạt
            </Button>
            <Button size="icon" onClick={() => setIsAddUserDialogOpen(true)}>
              <Plus className="w-5 h-5" />
              <span className="sr-only">Thêm thành viên</span>
            </Button>
          </div>
        )}
      </div>
      
      <AddUserDialog 
        isOpen={isAddUserDialogOpen} 
        onOpenChange={setIsAddUserDialogOpen}
        onUserAdded={handleUserAdded}
      />
      <BulkAddUserDialog
        isOpen={isBulkAddDialogOpen}
        onOpenChange={setIsBulkAddDialogOpen}
        onUsersAdded={handleUserAdded}
      />
      
      <div className="space-y-4">
        {loading ? (
            <div className="flex items-center justify-center pt-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ) : users.length > 0 ? (
            users.map(user => (
              <Card key={user.uid} className="shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-secondary rounded-full">
                    <UserIcon className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.apartment && <p className="text-xs text-muted-foreground">Căn hộ: {user.apartment}</p>}
                  </div>
                </CardContent>
              </Card>
            ))
        ) : (
             <p className="text-center text-muted-foreground pt-10">Chưa có thành viên nào.</p>
        )}
      </div>
    </div>
  );
}
