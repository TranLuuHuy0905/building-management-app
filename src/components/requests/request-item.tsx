'use client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Request } from '@/lib/types';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';

const getStatusBadge = (status: Request['status']) => {
    switch (status) {
        case 'pending': return <Badge variant="outline">Chờ xử lý</Badge>;
        case 'processing': return <Badge variant="secondary">Đang xử lý</Badge>;
        case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80">Hoàn thành</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

export function RequestItem({ request }: { request: Request }) {
    const { currentUser } = useAuth();
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [completedAt, setCompletedAt] = useState<string | null>(null);

    useEffect(() => {
        setCreatedAt(request.createdAt);
        if (request.completedAt) {
            setCompletedAt(request.completedAt);
        }
    }, [request.createdAt, request.completedAt]);

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between">
                <CardTitle className="text-lg">{request.title}</CardTitle>
                {getStatusBadge(request.status)}
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">{request.description}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                    <p>Căn hộ: <span className="font-medium text-foreground">{request.apartment}</span></p>
                    {createdAt && <p>Ngày tạo: <span className="font-medium text-foreground">{createdAt}</span></p>}
                    {completedAt && <p>Hoàn thành: <span className="font-medium text-foreground">{completedAt}</span></p>}
                </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
                {request.status === 'completed' && request.rating && (
                    <div className="flex items-center gap-1 self-end">
                        {[...Array(request.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                        {[...Array(5 - request.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gray-300" />
                        ))}
                    </div>
                )}
                 {currentUser?.role === 'technician' && request.status !== 'completed' && (
                    <Button className="bg-green-500 hover:bg-green-600">
                      Cập nhật tiến độ
                    </Button>
                  )}
                  
                  {currentUser?.role === 'resident' && request.status === 'completed' && !request.rating && (
                    <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700">
                      Đánh giá dịch vụ
                    </Button>
                  )}
            </CardFooter>
        </Card>
    );
}
