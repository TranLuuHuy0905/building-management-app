'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, DocumentData } from 'firebase/firestore';
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
    };
}

export async function getNotifications(params?: { take?: number }): Promise<Notification[]> {
    try {
        const notificationsRef = collection(db, 'notifications');
        let q = query(notificationsRef, orderBy('date', 'desc'));

        if(params?.take){
            q = query(q, limit(params.take));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => docToNotification(doc));

    } catch (error) {
        console.error("Error fetching notifications: ", error);
        return [];
    }
}
