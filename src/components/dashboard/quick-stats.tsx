'use client';
import { useAuth } from '@/contexts/auth-context';
import { requests, bills } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Wrench, CheckCircle } from 'lucide-react';

export function QuickStats() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const renderResidentStats = () => {
    const unpaidTotal = bills
      .filter((b) => b.apartment === currentUser?.apartment && b.status === 'unpaid')
      .reduce((sum, b) => sum + b.total, 0);
    const processingRequests = requests.filter(
      (r) => r.apartment === currentUser?.apartment && r.status !== 'completed'
    ).length;

    return (
      <>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa thanh toán</CardTitle>
            <CreditCard className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(unpaidTotal)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yêu cầu đang xử lý</CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{processingRequests}</div>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderAdminStats = () => {
    const totalRevenue = bills
      .filter((b) => b.status === 'paid' && b.month === '09/2025')
      .reduce((sum, b) => sum + b.total, 0);
    const pendingRequests = requests.filter((r) => r.status === 'pending').length;

    return (
      <>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thu tháng này</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yêu cầu chờ xử lý</CardTitle>
            <Wrench className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{pendingRequests}</div>
          </CardContent>
        </Card>
      </>
    );
  };

  const renderTechnicianStats = () => {
    const myTasks = requests.filter(
      (r) => r.assignedTo === currentUser?.id && r.status !== 'completed'
    ).length;
    const completedTasks = requests.filter(
        (r) => r.assignedTo === currentUser?.id && r.status === 'completed'
    ).length;

    return (
      <>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhiệm vụ của tôi</CardTitle>
            <Wrench className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{myTasks}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>
      </>
    );
  };
  
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
