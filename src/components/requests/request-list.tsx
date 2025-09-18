'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { RequestItem } from './request-item';
import type { Request } from '@/lib/types';
import { getRequests } from '@/lib/services/request-service';
import { Skeleton } from '@/components/ui/skeleton';

export function RequestList() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.buildingName) return;

    const fetchRequests = async () => {
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
    };
    fetchRequests();
  }, [currentUser]);
  
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
          <Button size="icon">
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
