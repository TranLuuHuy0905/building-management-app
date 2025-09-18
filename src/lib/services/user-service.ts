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


export async function checkApartmentAndPhoneUniqueness(
    buildingName: string, 
    apartment: string, 
    phone: string
): Promise<{ isUnique: boolean, message: string }> {
    const usersRef = collection(db, 'users');

    // Check for apartment uniqueness
    const apartmentQuery = query(usersRef, where('buildingName', '==', buildingName), where('apartment', '==', apartment), limit(1));
    const apartmentSnapshot = await getDocs(apartmentQuery);
    if (!apartmentSnapshot.empty) {
        return { isUnique: false, message: `Số căn hộ ${apartment} đã tồn tại trong tòa nhà này.` };
    }

    // Check for phone uniqueness
    const phoneQuery = query(usersRef, where('buildingName', '==', buildingName), where('phone', '==', phone), limit(1));
    const phoneSnapshot = await getDocs(phoneQuery);
    if (!phoneSnapshot.empty) {
        return { isUnique: false, message: `Số điện thoại ${phone} đã tồn tại trong tòa nhà này.` };
    }

    return { isUnique: true, message: '' };
}
