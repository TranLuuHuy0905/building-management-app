'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import type { Request } from '@/lib/types';

function docToRequest(doc: DocumentData): Request {
    const data = doc.data();
    return {
        id: doc.id,
        type: data.type,
        title: data.title,
        description: data.description,
        apartment: data.apartment,
        status: data.status,
        createdBy: data.createdBy,
        assignedTo: data.assignedTo,
        createdAt: data.createdAt,
        completedAt: data.completedAt,
        rating: data.rating,
    };
}

export async function getRequests(params?: { apartment?: string, assignedTo?: string, status?: 'pending' | 'processing' | 'completed' }): Promise<Request[]> {
    try {
        const requestsRef = collection(db, 'requests');
        let q = query(requestsRef);

        if (params?.apartment) {
            q = query(q, where('apartment', '==', params.apartment));
        }
        if (params?.assignedTo) {
            q = query(q, where('assignedTo', '==', params.assignedTo));
        }
         if (params?.status) {
            q = query(q, where('status', '==', params.status));
        }


        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => docToRequest(doc));
    } catch (error) {
        console.error("Error fetching requests: ", error);
        return [];
    }
}
