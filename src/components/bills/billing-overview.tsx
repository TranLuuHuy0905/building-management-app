'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bills } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Banknote, CircleDollarSign } from 'lucide-react';

export function BillingOverview() {
    const totalRevenue = bills
        .filter(b => b.status === 'paid' && b.month === '09/2025')
        .reduce((sum, b) => sum + b.total, 0);

    const totalDebt = bills
        .filter(b => b.status === 'unpaid')
        .reduce((sum, b) => sum + b.total, 0);

    return (
        <Card className="mb-6 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-headline">Tổng quan thu phí</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                        <div className="p-3 bg-green-100 rounded-full">
                           <Banknote className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng thu tháng này</p>
                            <p className="text-xl font-bold text-green-700">{formatCurrency(totalRevenue)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg">
                        <div className="p-3 bg-red-100 rounded-full">
                            <CircleDollarSign className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Tổng nợ</p>
                            <p className="text-xl font-bold text-red-700">{formatCurrency(totalDebt)}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
