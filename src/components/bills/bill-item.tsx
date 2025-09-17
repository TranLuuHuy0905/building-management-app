'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Bill } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const getStatusBadge = (status: Bill['status']) => {
    switch (status) {
        case 'paid': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100/80">Đã thanh toán</Badge>;
        case 'unpaid': return <Badge variant="destructive">Chưa thanh toán</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

export function BillItem({ bill }: { bill: Bill }) {
    const { currentUser } = useAuth();

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg">Hóa đơn tháng {bill.month}</CardTitle>
                        {currentUser?.role === 'admin' && (
                            <p className="text-sm text-muted-foreground">Căn hộ: {bill.apartment}</p>
                        )}
                    </div>
                    {getStatusBadge(bill.status)}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Phí dịch vụ:</span><span>{formatCurrency(bill.serviceFee)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Phí giữ xe:</span><span>{formatCurrency(bill.parking)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tiền điện:</span><span>{formatCurrency(bill.electricity)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tiền nước:</span><span>{formatCurrency(bill.water)}</span></div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold text-base"><span className="text-foreground">Tổng cộng:</span><span className="text-primary">{formatCurrency(bill.total)}</span></div>
                </div>
                <div className="text-xs text-muted-foreground">
                    {bill.status === 'paid' ? (
                        <p>Đã thanh toán: {bill.paidDate}</p>
                    ) : (
                        <p>Hạn thanh toán: {bill.dueDate}</p>
                    )}
                </div>
            </CardContent>
            {bill.status === 'unpaid' && currentUser?.role === 'resident' && (
                <CardFooter>
                    <Button className="w-full">
                        Thanh toán ngay
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
