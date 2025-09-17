'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Upload } from 'lucide-react';
import type { User } from '@/lib/types';
import { getUsers } from '@/lib/services/user-service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { AddUserDialog } from './add-user-dialog';
import { BulkAddUserDialog } from './bulk-add-user-dialog';
import { Card, CardContent } from '../ui/card';

const roleBadges: { [key in User['role']]: React.ReactNode } = {
    'admin': <Badge variant="destructive">Quản lý</Badge>,
    'resident': <Badge variant="secondary">Cư dân</Badge>,
    'technician': <Badge variant="outline">Kỹ thuật</Badge>,
}

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
      
      // Filter to show only residents and sort them by name
      const residentUsers = fetchedUsers
        .filter(user => user.role === 'resident')
        .sort((a, b) => a.name.localeCompare(b.name));

      setUsers(residentUsers);
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
        <h2 className="text-2xl font-bold text-gray-800 font-headline">Quản lý Cư dân</h2>
        {currentUser?.role === 'admin' && (
          <div className="flex gap-2">
            <Button onClick={() => setIsBulkAddDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Tạo hàng loạt
            </Button>
            <Button onClick={() => setIsAddUserDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm mới
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
      
      <Card>
        <CardContent className="p-0">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Căn hộ</TableHead>
                    <TableHead>Vai trò</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map(user => (
                      <TableRow key={user.uid}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.apartment || 'N/A'}</TableCell>
                        <TableCell>{roleBadges[user.role]}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Chưa có tài khoản cư dân nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
