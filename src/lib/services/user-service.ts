'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, DocumentData, limit } from 'firebase/firestore';
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
        const q = query(usersRef, where('buildingName', '==', params.buildingName));
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => docToUser(doc));
    } catch (error) {
        console.error("Error fetching users: ", error);
        return [];
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
