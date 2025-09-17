'use client';

import { requests } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RequestItem } from './request-item';

export function RequestList() {
  const { currentUser } = useAuth();
  
  const getTitle = () => {
    if (!currentUser) return '';
    switch (currentUser.role) {
      case 'resident': return 'Phản ánh của tôi';
      case 'admin': return 'Quản lý phản ánh';
      case 'technician': return 'Nhiệm vụ của tôi';
      default: return 'Phản ánh';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (!currentUser) return false;
    if (currentUser.role === 'resident') return request.apartment === currentUser.apartment;
    if (currentUser.role === 'technician') return request.assignedTo === currentUser.uid;
    return true; // Admin sees all
  });
  
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
        {filteredRequests.map(request => (
          <RequestItem key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}
