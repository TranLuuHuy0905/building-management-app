'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData, doc, updateDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';

function docToUser(doc: DocumentData): User {
    const data = doc.data();
    return {
        uid: doc.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        apartment: data.apartment,
        buildingName: data.buildingName,
    };
}

export async function getUsers(params: { buildingName: string }): Promise<User[]> {
    try {
        const usersRef = collection(db, 'users');
        // Query only by buildingName to avoid composite index requirement.
        // Filtering by role will be done on the client side.
        const q = query(
            usersRef, 
            where('buildingName', '==', params.buildingName)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => docToUser(doc));
    } catch (error) {
        console.error("Error fetching users: ", error);
        return [];
    }
}

export async function updateUser(uid: string, data: Partial<User>): Promise<boolean> {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, data);
        return true;
    } catch (error) {
        console.error("Error updating user: ", error);
        return false;
    }
}
