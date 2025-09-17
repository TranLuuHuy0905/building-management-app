import { QuickStats } from "@/components/dashboard/quick-stats";
import { RecentNotifications } from "@/components/dashboard/recent-notifications";

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <QuickStats />
      <RecentNotifications />
    </div>
  );
}
