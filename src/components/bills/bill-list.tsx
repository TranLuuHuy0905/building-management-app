'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getBills } from '@/lib/services/bill-service';
import type { Bill } from '@/lib/types';
import { BillingOverview } from './billing-overview';
import { BillItem } from './bill-item';
import { Skeleton } from '@/components/ui/skeleton';

export function BillList() {
    const { currentUser } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
        if (!currentUser?.buildingName) return;

        const fetchBills = async () => {
            setLoading(true);
            const params: any = { buildingName: currentUser.buildingName };
            if (currentUser.role !== 'admin') {
                params.apartment = currentUser.apartment;
            }
            const fetchedBills = await getBills(params);
            setBills(fetchedBills);
            setLoading(false);
        };

        fetchBills();
    }, [currentUser]);

    const getTitle = () => {
      if (!currentUser) return '';
      return currentUser.role === 'admin' ? 'Quản lý thu phí' : 'Hóa đơn & Thanh toán';
    };

    return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 font-headline">{getTitle()}</h2>
          </div>

          {currentUser?.role === 'admin' && <BillingOverview bills={bills} loading={loading} />}
          
          <div className="space-y-4">
            {loading ? (
                <>
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </>
            ) : bills.length > 0 ? (
                bills.map(bill => (
                    <BillItem key={bill.id} bill={bill} />
                ))
            ) : (
                <p className="text-center text-muted-foreground">Không tìm thấy hóa đơn nào.</p>
            )}
          </div>
        </div>
      );
}
