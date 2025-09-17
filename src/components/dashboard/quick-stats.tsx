'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getRequests } from '@/lib/services/request-service';
import { getBills } from '@/lib/services/bill-service';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Wrench, CheckCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function QuickStats() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchStats = async () => {
        setLoading(true);
        let newStats = {};
        try {
            if (currentUser.role === 'resident') {
                const unpaidBills = await getBills({ apartment: currentUser.apartment, status: 'unpaid' });
                const processingRequests = (await getRequests({ apartment: currentUser.apartment })).filter(r => r.status !== 'completed');
                newStats = {
                    unpaidTotal: unpaidBills.reduce((sum, b) => sum + b.total, 0),
                    processingRequests: processingRequests.length
                };
            } else if (currentUser.role === 'admin') {
                const paidBills = await getBills({ status: 'paid' }); // Simplified for demo
                const pendingRequests = await getRequests({ status: 'pending' });
                newStats = {
                    totalRevenue: paidBills.reduce((sum, b) => sum + b.total, 0),
                    pendingRequests: pendingRequests.length
                };
            } else if (currentUser.role === 'technician') {
                const myRequests = await getRequests({ assignedTo: currentUser.uid });
                newStats = {
                    myTasks: myRequests.filter(r => r.status !== 'completed').length,
                    completedTasks: myRequests.filter(r => r.status === 'completed').length,
                };
            }
            setStats(newStats);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
            setStats({}); // Set to empty to avoid render errors
        }
        setLoading(false);
    };

    fetchStats();
  }, [currentUser]);


  if (loading) {
      return (
          <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
          </div>
      )
  }

  const renderResidentStats = () => (
      <>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa thanh toán</CardTitle>
            <CreditCard className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(stats?.unpaidTotal || 0)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yêu cầu đang xử lý</CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.processingRequests || 0}</div>
          </CardContent>
        </Card>
      </>
    );

  const renderAdminStats = () => (
    <>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
          <CreditCard className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats?.totalRevenue || 0)}</div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Yêu cầu chờ xử lý</CardTitle>
          <Wrench className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{stats?.pendingRequests || 0}</div>
        </CardContent>
      </Card>
    </>
  );

  const renderTechnicianStats = () => (
      <>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhiệm vụ của tôi</CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats?.myTasks || 0}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.completedTasks || 0}</div>
          </CardContent>
        </Card>
      </>
    );
  
  const getStatsForRole = () => {
    switch (currentUser?.role) {
      case 'resident': return renderResidentStats();
      case 'admin': return renderAdminStats();
      case 'technician': return renderTechnicianStats();
      default: return null;
    }
  }

  return <div className="grid grid-cols-2 gap-4">{getStatsForRole()}</div>;
}
