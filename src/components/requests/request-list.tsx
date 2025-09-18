'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { RequestItem } from './request-item';
import type { Request } from '@/lib/types';
import { getRequests, createRequest } from '@/lib/services/request-service';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateRequestDialog } from './create-request-dialog';
import { useToast } from '@/hooks/use-toast';

export function RequestList() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!currentUser?.buildingName) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const params: any = { buildingName: currentUser.buildingName };
    if (currentUser.role === 'resident') {
      params.apartment = currentUser.apartment;
    } else if (currentUser.role === 'technician') {
      params.assignedTo = currentUser.uid;
    }
    const fetchedRequests = await getRequests(params);
    setRequests(fetchedRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreateRequest = async (data: Omit<Request, 'id' | 'apartment' | 'status' | 'createdBy' | 'assignedTo' | 'createdAt' | 'buildingName'>) => {
    if (!currentUser || !currentUser.apartment || !currentUser.buildingName) {
        toast({variant: 'destructive', title: "Lỗi", description: "Không thể xác định thông tin người dùng."});
        return;
    }
    
    const requestData: Omit<Request, 'id'> = {
        ...data,
        apartment: currentUser.apartment,
        buildingName: currentUser.buildingName,
        status: 'pending',
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        assignedTo: '', // Will be assigned by admin
    };

    const newRequestId = await createRequest(requestData);

    if (newRequestId) {
        toast({title: "Thành công", description: "Phản ánh của bạn đã được gửi đi."});
        fetchRequests(); // Refresh the list
        setIsCreateDialogOpen(false);
    } else {
        toast({variant: 'destructive', title: "Lỗi", description: "Không thể gửi phản ánh. Vui lòng thử lại."});
    }
  };
  
  const getTitle = () => {
    if (!currentUser) return '';
    switch (currentUser.role) {
      case 'resident': return 'Phản ánh của tôi';
      case 'admin': return 'Quản lý phản ánh';
      case 'technician': return 'Nhiệm vụ của tôi';
      default: return 'Phản ánh';
    }
  };
  
  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-headline">{getTitle()}</h2>
          {currentUser?.role === 'resident' && (
            <Button size="icon" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-5 h-5" />
              <span className="sr-only">Tạo phản ánh</span>
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {loading ? (
              <>
                  <Skeleton className="h-44 w-full" />
                  <Skeleton className="h-44 w-full" />
              </>
          ) : requests.length > 0 ? (
              requests.map(request => (
                  <RequestItem key={request.id} request={request} />
              ))
          ) : (
              <p className="text-center text-muted-foreground pt-10">Không tìm thấy phản ánh nào.</p>
          )}
        </div>
      </div>
      <CreateRequestDialog 
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onFormSubmit={handleCreateRequest}
      />
    </>
  );
}
