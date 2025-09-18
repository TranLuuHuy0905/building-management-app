
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Request } from '@/lib/types';
import { getRequests } from '@/lib/services/request-service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wrench, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';


const getStatusBadge = (status: Request['status']) => {
    switch (status) {
        case 'pending': return <Badge variant="outline">Chờ xử lý</Badge>;
        case 'processing': return <Badge variant="secondary">Đang xử lý</Badge>;
        case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80">Hoàn thành</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

export function RecentRequests() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.buildingName) return;

    const fetchRequests = async () => {
        setLoading(true);
        // Fetch recent requests instead of notifications
        const fetchedRequests = await getRequests({ buildingName: currentUser.buildingName });
        // Sort by creation date descending and take the first 3
        const recent = fetchedRequests
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
        setRequests(recent);
        setLoading(false);
    };
    fetchRequests();
  }, [currentUser]);

  const getRequestPageHref = () => {
      if (!currentUser) return '/';
      return `/${currentUser.role}/requests`;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
                <Wrench className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-headline">Phản ánh gần đây</CardTitle>
        </div>
        <Button asChild variant="ghost" size="sm">
            <Link href={getRequestPageHref()}>Xem tất cả</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex items-center justify-center h-24">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        ) : requests.length > 0 ? (
            <div className="space-y-4">
            {requests.map((request) => (
                 <div key={request.id} className="flex items-start space-x-4 p-3 bg-secondary/50 rounded-lg">
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-800 pr-4">{request.title}</h4>
                            {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Căn hộ: {request.apartment}</p>
                        <p className="text-xs text-muted-foreground/80 mt-2">{new Date(request.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-center text-muted-foreground">Không có phản ánh nào gần đây.</p>
        )}
      </CardContent>
    </Card>
  );
}
