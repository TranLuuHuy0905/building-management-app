import { QuickStats } from "@/components/dashboard/quick-stats";
import { RecentRequests } from "@/components/dashboard/recent-requests";

export default function ResidentHomePage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <QuickStats />
      <RecentRequests />
    </div>
  );
}
