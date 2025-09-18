'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, DocumentData, addDoc, deleteDoc, doc } from 'firebase/firestore';
import type { Notification } from '@/lib/types';

function docToNotification(doc: DocumentData): Notification {
    const data = doc.data();
    return {
        id: doc.id,
        type: data.type,
        title: data.title,
        content: data.content,
        date: data.date,
        targetType: data.targetType,
        buildingName: data.buildingName,
    };
}

export async function getNotifications(params: { buildingName: string; take?: number }): Promise<Notification[]> {
    try {
        const notificationsRef = collection(db, 'notifications');
        let q = query(notificationsRef, where('buildingName', '==', params.buildingName), orderBy('date', 'desc'));

        if(params.take){
            q = query(q, limit(params.take));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => docToNotification(doc));

    } catch (error) {
        console.error("Error fetching notifications: ", error);
        return [];
    }
}


export async function createNotification(notificationData: Omit<Notification, 'id'>): Promise<string | null> {
    try {
        const notificationsRef = collection(db, 'notifications');
        const docRef = await addDoc(notificationsRef, notificationData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating notification: ", error);
        return null;
    }
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await deleteDoc(notificationRef);
        return true;
    } catch (error) {
        console.error("Error deleting notification: ", error);
        return false;
    }
}
