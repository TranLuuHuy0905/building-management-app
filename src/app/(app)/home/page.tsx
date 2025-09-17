import { QuickStats } from "@/components/dashboard/quick-stats";
import { RecentNotifications } from "@/components/dashboard/recent-notifications";
import { AiSuggestions } from "@/components/dashboard/ai-suggestions";

export default function HomePage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <QuickStats />
      <AiSuggestions />
      <RecentNotifications />
    </div>
  );
}
