'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { RequestItem } from './request-item';
import type { Request } from '@/lib/types';
import { getRequests } from '@/lib/services/request-service';
import { Skeleton } from '@/components/ui/skeleton';
import { createNotification } from '@/lib/services/notification-service';

export function RequestList() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

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
    setRequests(fetchedRequests);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreateRequest = async () => {
    // This is a placeholder for opening a "Create Request" dialog.
    // For now, we'll simulate creating a request and a notification.
    if (!currentUser || !currentUser.buildingName) return;
    
    console.log("Simulating request creation...");
    
    // In a real app, you would get this data from a form.
    const newRequestData = {
      title: "Vòi nước bị rò rỉ",
      apartment: currentUser.apartment || 'N/A'
    };

    // Simulate creating a request in DB (not implemented here)
    
    // Then, create a notification for the admin.
    await createNotification({
      title: "Phản ánh mới",
      content: `Căn hộ ${newRequestData.apartment} đã báo cáo một sự cố mới: "${newRequestData.title}"`,
      type: 'warning',
      targetType: 'admin',
      buildingName: currentUser.buildingName,
      date: new Date().toLocaleDateString('vi-VN')
    });
    
    console.log("Notification created for admin.");
    // You would then refetch requests and potentially navigate or show a toast.
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 font-headline">{getTitle()}</h2>
        {currentUser?.role === 'resident' && (
          <Button size="icon" onClick={handleCreateRequest}>
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
  );
}
