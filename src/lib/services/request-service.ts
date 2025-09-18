'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData, addDoc } from 'firebase/firestore';
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
        buildingName: data.buildingName,
    };
}

export async function getRequests(params: { buildingName: string; apartment?: string, assignedTo?: string, status?: 'pending' | 'processing' | 'completed' }): Promise<Request[]> {
    try {
        const requestsRef = collection(db, 'requests');
        let q = query(requestsRef, where('buildingName', '==', params.buildingName));

        if (params.apartment) {
            q = query(q, where('apartment', '==', params.apartment));
        }
        if (params.assignedTo) {
            q = query(q, where('assignedTo', '==', params.assignedTo));
        }
         if (params.status) {
            q = query(q, where('status', '==', params.status));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => docToRequest(doc));
    } catch (error) {
        console.error("Error fetching requests: ", error);
        return [];
    }
}

export async function createRequest(requestData: Omit<Request, 'id'>): Promise<string | null> {
    try {
        const requestsRef = collection(db, 'requests');
        const docRef = await addDoc(requestsRef, requestData);
        return docRef.id;
    } catch (error) {
        console.error("Error creating request: ", error);
        return null;
    }
}
