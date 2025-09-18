'use server';

import { firestoreAdmin, messagingAdmin } from '@/lib/firebaseAdmin';
import type { Notification, User } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Creates a notification, saves it to Firestore, and sends push notifications via FCM.
 * @param notificationData The notification data, excluding the ID.
 * @returns An object with the count of successful and failed deliveries.
 */
export async function createAndSendNotification(notificationData: Omit<Notification, 'id'>): Promise<{ success: number; failed: number; newNotificationId: string | null }> {
    try {
        // Step 1: Save the notification to Firestore.
        const notificationRef = await firestoreAdmin.collection('notifications').add({
            ...notificationData,
            date: FieldValue.serverTimestamp(), // Use server timestamp for accuracy
        });
        const newNotificationId = notificationRef.id;

        // Step 2: Get all FCM tokens for the target users.
        const usersRef = firestoreAdmin.collection('users');
        let usersQuery = usersRef.where('buildingName', '==', notificationData.buildingName);
        
        if (notificationData.targetType !== 'all') {
            usersQuery = usersQuery.where('role', '==', notificationData.targetType);
        }

        const usersSnapshot = await usersQuery.get();
        if (usersSnapshot.empty) {
            console.log("No users found for the target criteria. Notification saved but not sent.");
            return { success: 0, failed: 0, newNotificationId };
        }

        const tokens: string[] = [];
        usersSnapshot.forEach(doc => {
            const user = doc.data() as User;
            if (user.fcmTokens && user.fcmTokens.length > 0) {
                tokens.push(...user.fcmTokens);
            }
        });

        if (tokens.length === 0) {
            console.log("No FCM tokens found for target users. Notification saved but not sent.");
            return { success: 0, failed: 0, newNotificationId };
        }

        // Step 3: Send multicast FCM message.
        const message = {
            notification: {
                title: notificationData.title,
                body: notificationData.content,
            },
            tokens: tokens,
        };

        const response = await messagingAdmin.sendEachForMulticast(message);
        
        // Step 4: Log errors for debugging.
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                    console.error(`FCM send failed for token: ${tokens[idx]}`, resp.error);
                }
            });
        }
        
        console.log(`FCM send result: ${response.successCount} success, ${response.failureCount} failed.`);

        return { success: response.successCount, failed: response.failureCount, newNotificationId };

    } catch (error) {
        console.error("Error creating and sending notification: ", error);
        return { success: 0, failed: 0, newNotificationId: null };
    }
}

/**
 * Retrieves notifications using the Admin SDK.
 * @param params Parameters for filtering notifications.
 * @returns A promise that resolves to an array of notifications.
 */
export async function getNotifications(params: { buildingName: string; take?: number }): Promise<Notification[]> {
    try {
        const notificationsRef = firestoreAdmin.collection('notifications');
        let query = notificationsRef
            .where('buildingName', '==', params.buildingName)
            .orderBy('date', 'desc');

        if (params.take) {
            query = query.limit(params.take);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const date = data.date.toDate(); // Convert Firestore Timestamp to JS Date
            return {
                id: doc.id,
                ...data,
                date: date.toISOString(), // Convert to ISO string for client-side compatibility
            } as Notification;
        });

    } catch (error) {
        console.error("Error fetching notifications with Admin SDK: ", error);
        return [];
    }
}

/**
 * Deletes a notification document from Firestore using the Admin SDK.
 * @param notificationId The ID of the notification to delete.
 * @returns A promise that resolves to true if deletion was successful, false otherwise.
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
    try {
        const notificationRef = firestoreAdmin.collection('notifications').doc(notificationId);
        await notificationRef.delete();
        return true;
    } catch (error) {
        console.error("Error deleting notification with Admin SDK: ", error);
        return false;
    }
}
