import { QuickStats } from "@/components/dashboard/quick-stats";
import { RecentRequests } from "@/components/dashboard/recent-requests";
import { RecentNotifications } from "@/components/dashboard/recent-notifications";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TechnicianHomePage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 font-headline">Nhiệm vụ của tôi</h1>
       <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <QuickStats />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <RecentNotifications />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <RecentRequests />
      </Suspense>
    </div>
  );
}
