import type { Notification, Request, Bill, User } from './types';

// Mock data is no longer needed as it is fetched from Firestore.
// The collections in Firestore should be 'notifications', 'requests', and 'bills'.
// The structure of the documents should match the types defined in 'src/lib/types.ts'.

export const users: User[] = [];

export const notifications: Notification[] = [];

export const requests: Request[] = [];

export const bills: Bill[] = [];
