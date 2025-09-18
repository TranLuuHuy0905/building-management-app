'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Upload, Pencil, Trash2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { getUsers, updateUser } from '@/lib/services/user-service';
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
import { ReauthDialog } from './reauth-dialog';
import { EditUserDialog } from './edit-user-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const roleBadges: { [key in User['role']]: React.ReactNode } = {
    'admin': <Badge variant="destructive">Quản lý</Badge>,
    'resident': <Badge variant="secondary">Cư dân</Badge>,
    'technician': <Badge variant="outline">Kỹ thuật</Badge>,
}

export function UserList() {
  const { currentUser, createResident, deleteResident } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);
  const [isReauthDialogOpen, setIsReauthDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Data for processing
  const [pendingUserData, setPendingUserData] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Reauth state
  const [reauthAction, setReauthAction] = useState<'create' | 'delete' | null>(null);
  const [adminPassword, setAdminPassword] = useState<string>('');


  const fetchUsers = useCallback(async () => {
    if (!currentUser?.buildingName) {
        setLoading(false);
        return;
    };
    setLoading(true);
    const fetchedUsers = await getUsers({ buildingName: currentUser.buildingName });
    
    const residentUsers = fetchedUsers
      .filter(user => user.role === 'resident')
      .sort((a, b) => a.name.localeCompare(b.name));

    setUsers(residentUsers);
    setLoading(false);
  }, [currentUser?.buildingName]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- Create User Flow ---
  const handleOpenAddUserDialog = () => {
    setPendingUserData(null);
    setIsAddUserDialogOpen(true);
  }

  const handleAddUserSubmit = (userData: any) => {
    setPendingUserData(userData);
    setIsAddUserDialogOpen(false);
    setReauthAction('create');
    setIsReauthDialogOpen(true);
  }

  // --- Edit User Flow ---
  const handleOpenEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleEditUserSubmit = async (updatedData: Partial<User>) => {
    if (!selectedUser) return;
    const success = await updateUser(selectedUser.uid, updatedData);
    if (success) {
      toast({ title: "Thành công", description: "Thông tin người dùng đã được cập nhật." });
      await fetchUsers();
      setIsEditUserDialogOpen(false);
      setSelectedUser(null);
    } else {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể cập nhật thông tin." });
    }
  };


  // --- Delete User Flow ---
  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    setIsDeleteDialogOpen(false);
    setReauthAction('delete');
    setIsReauthDialogOpen(true);
  };

  // --- Re-authentication Flow ---
  const handleReauthSuccess = async (password: string) => {
    if (reauthAction === 'create' && pendingUserData) {
      const success = await createResident(pendingUserData, password);
      if (success) {
        await fetchUsers();
      }
    } else if (reauthAction === 'delete' && selectedUser) {
      const success = await deleteResident(selectedUser, password);
      if(success) {
        toast({ title: "Thành công", description: `Đã xóa tài khoản ${selectedUser.name}.` });
        await fetchUsers();
      }
    }
    
    // Reset states
    setPendingUserData(null);
    setSelectedUser(null);
    setReauthAction(null);
    setIsReauthDialogOpen(false);
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
            <Button onClick={handleOpenAddUserDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm mới
            </Button>
          </div>
        )}
      </div>
      
      {/* --- DIALOGS --- */}
      <AddUserDialog 
        isOpen={isAddUserDialogOpen} 
        onOpenChange={setIsAddUserDialogOpen}
        onFormSubmit={handleAddUserSubmit}
      />
      <BulkAddUserDialog
        isOpen={isBulkAddDialogOpen}
        onOpenChange={setIsBulkAddDialogOpen}
        onUsersAdded={fetchUsers}
      />
       {selectedUser && (
        <EditUserDialog
          isOpen={isEditUserDialogOpen}
          onOpenChange={setIsEditUserDialogOpen}
          user={selectedUser}
          onFormSubmit={handleEditUserSubmit}
        />
      )}
      <ReauthDialog 
        isOpen={isReauthDialogOpen}
        onOpenChange={setIsReauthDialogOpen}
        onReauthSuccess={handleReauthSuccess}
      />
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể được hoàn tác. Tài khoản của{' '}
              <span className="font-bold">{selectedUser?.name}</span> sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
              Xác nhận Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- USER TABLE --- */}
      <Card>
        <CardContent className="p-0">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>Căn hộ</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map(user => (
                        <TableRow key={user.uid}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.apartment || 'N/A'}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                             <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(user)}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Sửa</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(user)} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Xóa</span>
                              </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Chưa có tài khoản cư dân nào.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
