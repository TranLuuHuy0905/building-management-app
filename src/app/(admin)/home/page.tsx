import { QuickStats } from "@/components/dashboard/quick-stats";
import { RecentNotifications } from "@/components/dashboard/recent-notifications";

export default function AdminHomePage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 font-headline">Bảng điều khiển</h1>
      <QuickStats />
      <RecentNotifications />
    </div>
  );
}
