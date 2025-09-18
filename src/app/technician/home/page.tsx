'use client';
import { QuickStats } from "@/components/dashboard/quick-stats";
import { RecentRequests } from "@/components/dashboard/recent-requests";
import { RecentNotifications } from "@/components/dashboard/recent-notifications";

export default function TechnicianHomePage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 font-headline">Nhiệm vụ của tôi</h1>
      <QuickStats />
      <RecentNotifications />
      <RecentRequests />
    </div>
  );
}
