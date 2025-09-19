'use server';

import { firestoreAdmin, messagingAdmin } from '@/lib/firebaseAdmin';
import type { Notification, Request, User } from '@/lib/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';

/**
 * Saves a user's FCM token to their user document in Firestore.
 * This is a Server Action called from the client.
 * @param token The FCM token to save.
 */
export async function saveUserFcmToken(token: string): Promise<void> {
  const session = cookies().get('__session')?.value || '';
  if (!session) {
    console.error("No session cookie found. User must be logged in to save FCM token.");
    return;
  }
  
  try {
    const decodedToken = await getAuth().verifySessionCookie(session, true);
    const userId = decodedToken.uid;
    
    if (!userId) {
        console.error("Could not verify user session. FCM token not saved.");
        return;
    }
    
    const userRef = firestoreAdmin.collection('users').doc(userId);
    await userRef.update({
      fcmTokens: FieldValue.arrayUnion(token)
    });

  } catch (error) {
    console.error("Error saving FCM token:", error);
  }
}


/**
 * Creates a notification, saves it to Firestore, and sends push notifications via FCM.
 * Includes cleanup of stale/invalid tokens.
 * @param notificationData The notification data, excluding the ID.
 * @returns An object with the count of successful and failed deliveries.
 */
export async function createAndSendNotification(notificationData: Omit<Notification, 'id' | 'date'>): Promise<{ success: number; failed: number; newNotificationId: string | null }> {
    try {
        // Step 1: Save the notification to Firestore.
        const notificationRef = await firestoreAdmin.collection('notifications').add({
            ...notificationData,
            date: FieldValue.serverTimestamp(), // Use server timestamp for accuracy
        });
        const newNotificationId = notificationRef.id;

        // Step 2: Get all FCM tokens for the target users.
        const usersRef = firestoreAdmin.collection('users');
        let usersQuery: FirebaseFirestore.Query = usersRef.where('buildingName', '==', notificationData.buildingName);
        
        if (notificationData.targetType !== 'all') {
            usersQuery = usersQuery.where('role', '==', notificationData.targetType);
        }

        const usersSnapshot = await usersQuery.get();
        if (usersSnapshot.empty) {
            console.log("No users found for the target criteria. Notification saved but not sent.");
            return { success: 0, failed: 0, newNotificationId };
        }

        let tokens: string[] = [];
        usersSnapshot.forEach(doc => {
            const user = doc.data() as User;
            if (user.fcmTokens && Array.isArray(user.fcmTokens)) {
                tokens.push(...user.fcmTokens);
            }
        });

        // Deduplicate tokens
        tokens = [...new Set(tokens)];

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
        
        // Step 4: Handle stale tokens and log errors.
        if (response.failureCount > 0) {
            const tokensToDelete: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errorCode = resp.error?.code;
                    // Check for errors indicating an invalid or unregistered token
                    if (errorCode === 'messaging/invalid-registration-token' ||
                        errorCode === 'messaging/registration-token-not-registered') {
                        const failedToken = tokens[idx];
                        console.log(`Stale/invalid token found: ${failedToken}. Marking for deletion.`);
                        tokensToDelete.push(failedToken);
                    } else {
                         console.error(`FCM send failed for token: ${tokens[idx]}`, resp.error);
                    }
                }
            });
            // Clean up stale tokens from Firestore
            if (tokensToDelete.length > 0) {
                await cleanupStaleTokens(tokensToDelete);
            }
        }
        
        console.log(`FCM send result: ${response.successCount} success, ${response.failureCount} failed.`);
        revalidatePath('/notifications');
        if(notificationData.targetType === 'all') {
            revalidatePath('/admin/home');
            revalidatePath('/resident/home');
            revalidatePath('/technician/home');
        } else {
             revalidatePath(`/${notificationData.targetType}/home`);
        }
        return { success: response.successCount, failed: response.failureCount, newNotificationId };

    } catch (error) {
        console.error("Error creating and sending notification: ", error);
        return { success: 0, failed: 0, newNotificationId: null };
    }
}

/**
 * Specifically sends a notification to admins and technicians when a new request is created.
 * @param request The newly created request object.
 */
export async function sendRequestNotification(request: Omit<Request, 'id'>): Promise<void> {
    const notificationData: Omit<Notification, 'id' | 'date'> = {
        title: `Phản ánh mới: ${request.title}`,
        content: `Cư dân tại căn hộ ${request.apartment} đã gửi một phản ánh mới.`,
        type: 'warning',
        targetType: 'all', // This will be overridden below
        buildingName: request.buildingName,
    };
    
    try {
        const serverTimestamp = FieldValue.serverTimestamp();

        // Create a notification record for admins
        await firestoreAdmin.collection('notifications').add({
            ...notificationData,
            targetType: 'admin',
            date: serverTimestamp,
        });

        // Create a separate notification record for technicians
         await firestoreAdmin.collection('notifications').add({
            ...notificationData,
            targetType: 'technician',
            date: serverTimestamp,
        });

        // Now, find all admins and technicians to send a push notification
        const usersRef = firestoreAdmin.collection('users');
        const usersQuery = usersRef
            .where('buildingName', '==', request.buildingName)
            .where('role', 'in', ['admin', 'technician']);

        const usersSnapshot = await usersQuery.get();
        if (usersSnapshot.empty) {
            console.log("No admins or technicians found to notify.");
            return;
        }

        let tokens: string[] = [];
        usersSnapshot.forEach(doc => {
            const user = doc.data() as User;
            if (user.fcmTokens && Array.isArray(user.fcmTokens)) {
                tokens.push(...user.fcmTokens);
            }
        });

        tokens = [...new Set(tokens)];

        if (tokens.length > 0) {
            const message = {
                notification: {
                    title: notificationData.title,
                    body: notificationData.content,
                },
                tokens: tokens,
            };
            const response = await messagingAdmin.sendEachForMulticast(message);
            console.log(`Request notification sent: ${response.successCount} success, ${response.failureCount} failed.`);
             if (response.failureCount > 0) {
                const tokensToDelete = response.responses
                    .map((resp, idx) => !resp.success ? tokens[idx] : null)
                    .filter((token): token is string => token !== null);
                await cleanupStaleTokens(tokensToDelete);
            }
        }
        revalidatePath('/notifications');
        revalidatePath('/admin/home');
        revalidatePath('/technician/home');

    } catch (error) {
        console.error("Error sending request notification: ", error);
    }
}


/**
 * Finds users with stale tokens and removes them from their fcmTokens array.
 * @param tokensToDelete Array of stale token strings.
 */
async function cleanupStaleTokens(tokensToDelete: string[]) {
    if (tokensToDelete.length === 0) return;
    
    console.log(`Cleaning up ${tokensToDelete.length} stale tokens...`);
    const usersRef = firestoreAdmin.collection('users');
    // Firestore 'array-contains-any' is limited to 10 values, so we may need to batch
    const batchSize = 10;
    for (let i = 0; i < tokensToDelete.length; i += batchSize) {
        const tokenBatch = tokensToDelete.slice(i, i + batchSize);
        try {
            const querySnapshot = await usersRef.where('fcmTokens', 'array-contains-any', tokenBatch).get();
            if (!querySnapshot.empty) {
                const batch = firestoreAdmin.batch();
                querySnapshot.forEach(doc => {
                    const userRef = usersRef.doc(doc.id);
                    batch.update(userRef, { fcmTokens: FieldValue.arrayRemove(...tokenBatch) });
                });
                await batch.commit();
                console.log(`Removed stale tokens from ${querySnapshot.size} users in this batch.`);
            }
        } catch(error) {
            console.error("Error during stale token cleanup batch:", error);
        }
    }
}


/**
 * Retrieves notifications using the Admin SDK, optimized for user roles.
 * @param params Parameters for filtering notifications.
 * @returns A promise that resolves to an array of notifications.
 */
export async function getNotifications(params: { buildingName: string; role?: User['role']; take?: number }): Promise<Notification[]> {
    try {
        const notificationsRef = firestoreAdmin.collection('notifications');
        let query: FirebaseFirestore.Query = notificationsRef.where('buildingName', '==', params.buildingName);
        
        // Admins see all notifications regardless of targetType.
        // Other roles see 'all' and their specific role notifications.
        if (params.role && params.role !== 'admin') {
            query = query.where('targetType', 'in', ['all', params.role]);
        }
        
        query = query.orderBy('date', 'desc');

        if (params.take) {
            query = query.limit(params.take);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const date = (data.date as Timestamp)?.toDate();
            return {
                id: doc.id,
                ...data,
                date: date ? date.toISOString() : new Date().toISOString(),
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
        revalidatePath('/notifications');
        return true;
    } catch (error) {
        console.error("Error deleting notification with Admin SDK: ", error);
        return false;
    }
}
