'use client';
import { bills } from '@/lib/data';
import { useAuth } from '@/contexts/auth-context';
import { BillingOverview } from './billing-overview';
import { BillItem } from './bill-item';

export function BillList() {
    const { currentUser } = useAuth();
  
    const getTitle = () => {
      if (!currentUser) return '';
      return currentUser.role === 'admin' ? 'Quản lý thu phí' : 'Hóa đơn & Thanh toán';
    };
  
    const filteredBills = bills.filter(bill => {
      if (!currentUser) return false;
      return currentUser.role === 'admin' || bill.apartment === currentUser.apartment;
    });

    return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 font-headline">{getTitle()}</h2>
          </div>

          {currentUser?.role === 'admin' && <BillingOverview />}
          
          <div className="space-y-4">
            {filteredBills.map(bill => (
              <BillItem key={bill.id} bill={bill} />
            ))}
          </div>
        </div>
      );
}
