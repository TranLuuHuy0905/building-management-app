import { getNotifications } from "@/lib/services/notification-service";
import { getCurrentUser } from "@/lib/services/get-current-user";
import { NotificationListView } from "@/components/notifications/notification-list-view";
import { User } from "@/lib/types";

export default async function NotificationsPage() {
    const user = await getCurrentUser();

    if (!user?.buildingName || !user?.role) {
        return <p className="text-center text-muted-foreground pt-10">Không thể tải thông báo.</p>;
    }

    const initialNotifications = await getNotifications({ 
        buildingName: user.buildingName,
        role: user.role 
    });

    return (
        <div className="container mx-auto p-4">
            <NotificationListView initialNotifications={initialNotifications} user={user} />
        </div>
    );
}
