// src/lib/services/get-current-user.ts
'use server';

import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import type { User } from '../types';

/**
 * Retrieves the full user object for the currently authenticated user from a Server Component or Server Action.
 * @returns A promise that resolves to the User object or null if not authenticated.
 */
export async function getCurrentUser(): Promise<(User & { uid: string }) | null> {
  const session = cookies().get('__session')?.value || '';
  if (!session) return null;

  try {
    const decodedToken = await getAuth().verifySessionCookie(session, true);
    const userDoc = await firestoreAdmin.collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      // Important: Add the uid to the user data object
      return { uid: decodedToken.uid, ...userDoc.data() } as (User & { uid: string });
    }
    
    return null;
  } catch (error) {
    console.error("Error getting current user from session:", error);
    return null;
  }
}
