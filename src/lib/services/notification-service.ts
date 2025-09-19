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
 * Creates a notification and saves it to Firestore.
 * This function NO LONGER sends push notifications.
 * @param notificationData The notification data, excluding the ID.
 * @returns An object with the ID of the newly created notification.
 */
export async function createAndSendNotification(notificationData: Omit<Notification, 'id' | 'date'>): Promise<{ newNotificationId: string | null }> {
    try {
        // Step 1: Save the notification to Firestore.
        const notificationRef = await firestoreAdmin.collection('notifications').add({
            ...notificationData,
            date: FieldValue.serverTimestamp(), // Use server timestamp for accuracy
        });
        const newNotificationId = notificationRef.id;

        // Step 2: Revalidate paths to update UI for relevant users
        revalidatePath('/notifications');
        if (notificationData.targetType === 'all') {
            ['admin', 'resident', 'technician'].forEach(role => revalidatePath(`/${role}/home`));
        } else {
            revalidatePath(`/${notificationData.targetType}/home`);
            revalidatePath('/admin/home'); // Also revalidate admin home
        }

        console.log(`Notification ${newNotificationId} created successfully.`);

        // For simplicity and to match user request, we are not sending FCM messages here.
        // We are only creating the notification record in the database.
        // The return object is simplified.
        return { newNotificationId };

    } catch (error) {
        console.error("Error creating notification: ", error);
        return { newNotificationId: null };
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

        // Create a notification record for admins and technicians
        const rolesToNotify: Array<User['role']> = ['admin', 'technician'];
        
        for (const role of rolesToNotify) {
            await firestoreAdmin.collection('notifications').add({
                ...notificationData,
                targetType: role,
                date: serverTimestamp,
            });
        }

        const usersRef = firestoreAdmin.collection('users');
        const currentUser = await getCurrentUser();

        // Revalidate relevant paths
        revalidatePath('/notifications');
        rolesToNotify.forEach(role => revalidatePath(`/${role}/home`));
        if (currentUser) {
            revalidatePath(`/${currentUser.role}/requests`);
        }


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

async function getCurrentUserRole() {
  const session = cookies().get('__session')?.value || '';
  if (!session) return null;
  try {
    const decodedToken = await getAuth().verifySessionCookie(session, true);
    const userDoc = await firestoreAdmin.collection('users').doc(decodedToken.uid).get();
    if (userDoc.exists) {
        return (userDoc.data() as User).role;
    }
    return null;
  } catch {
    return null;
  }
}
async function getCurrentUser() {
  const session = cookies().get('__session')?.value || '';
  if (!session) return null;
  try {
    const decodedToken = await getAuth().verifySessionCookie(session, true);
    const userDoc = await firestoreAdmin.collection('users').doc(decodedToken.uid).get();
    if (userDoc.exists) {
        return userDoc.data() as User;
    }
    return null;
  } catch {
    return null;
  }
}
