'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Bill } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Banknote, CircleDollarSign } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function BillingOverview({ bills, loading }: { bills: Bill[], loading: boolean }) {
    
    // This calculation is now simplified. For real-world apps, consider server-side aggregation.
    const totalRevenue = bills
        .filter(b => b.status === 'paid') 
        .reduce((sum, b) => sum + b.total, 0);

    const totalDebt = bills
        .filter(b => b.status === 'unpaid')
        .reduce((sum, b) => sum + b.total, 0);
    
    if(loading) {
        return <Skeleton className="h-40 w-full mb-6" />
    }

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
                            <p className="text-sm text-muted-foreground">Tổng thu</p>
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
