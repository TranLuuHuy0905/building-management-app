'use server';

import { firestoreAdmin } from '@/lib/firebaseAdmin';
import type { Notification, User } from '@/lib/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './get-current-user';

/**
 * Creates a notification and saves it to Firestore.
 * This function NO LONGER sends push notifications.
 * @param notificationData The notification data, excluding the ID.
 * @returns An object with the ID of the newly created notification.
 */
export async function createAndSendNotification(notificationData: Omit<Notification, 'id' | 'date'>): Promise<{ newNotificationId: string | null }> {
    try {
        const notificationRef = await firestoreAdmin.collection('notifications').add({
            ...notificationData,
            date: FieldValue.serverTimestamp(),
        });
        const newNotificationId = notificationRef.id;

        // Revalidate paths to update UI for relevant users
        revalidatePath('/notifications');
        if (notificationData.targetType === 'all') {
            revalidatePath('/admin/home');
            revalidatePath('/resident/home');
            revalidatePath('/technician/home');
        } else {
            revalidatePath(`/${notificationData.targetType}/home`);
            revalidatePath('/admin/home');
        }

        return { newNotificationId };

    } catch (error) {
        console.error("Error creating notification: ", error);
        return { newNotificationId: null };
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
        revalidatePath('/admin/home');
        revalidatePath('/resident/home');
        revalidatePath('/technician/home');
        return true;
    } catch (error) {
        console.error("Error deleting notification with Admin SDK: ", error);
        return false;
    }
}


/**
 * Saves a user's Firebase Cloud Messaging (FCM) token to their user document in Firestore.
 * @param token The FCM token to save.
 */
export async function saveUserFcmToken(token: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    console.warn('Cannot save FCM token: user not authenticated.');
    return;
  }

  try {
    const userRef = firestoreAdmin.collection('users').doc(user.uid);
    await userRef.update({
      fcmTokens: FieldValue.arrayUnion(token),
    });
    console.log('Successfully saved FCM token for user:', user.uid);
    // Revalidate the root layout to ensure the user object with the new token is fresh
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}
