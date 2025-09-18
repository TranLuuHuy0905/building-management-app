'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData, limit, doc, updateDoc } from 'firebase/firestore';
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
        const q = query(
            usersRef, 
            where('buildingName', '==', params.buildingName),
            where('role', '==', 'resident')
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


export async function checkApartmentExists(
    buildingName: string, 
    apartment: string
): Promise<boolean> {
    const usersRef = collection(db, 'users');
    const apartmentQuery = query(
        usersRef, 
        where('buildingName', '==', buildingName), 
        where('apartment', '==', apartment), 
        limit(1)
    );
    const apartmentSnapshot = await getDocs(apartmentQuery);
    return !apartmentSnapshot.empty;
}
