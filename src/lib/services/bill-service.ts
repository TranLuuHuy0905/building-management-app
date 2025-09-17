'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import type { Bill } from '@/lib/types';

function docToBill(doc: DocumentData): Bill {
    const data = doc.data();
    return {
        id: doc.id,
        apartment: data.apartment,
        month: data.month,
        serviceFee: data.serviceFee,
        parking: data.parking,
        electricity: data.electricity,
        water: data.water,
        total: data.total,
        status: data.status,
        dueDate: data.dueDate,
        paidDate: data.paidDate,
    };
}

export async function getBills(params?: { apartment?: string, status?: 'paid' | 'unpaid', month?: string }): Promise<Bill[]> {
    try {
        const billsRef = collection(db, 'bills');
        let q = query(billsRef);

        if (params?.apartment) {
            q = query(q, where('apartment', '==', params.apartment));
        }
        if (params?.status) {
            q = query(q, where('status', '==', params.status));
        }
        if (params?.month) {
            q = query(q, where('month', '==', params.month));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => docToBill(doc));
    } catch (error) {
        console.error("Error fetching bills: ", error);
        return [];
    }
}
