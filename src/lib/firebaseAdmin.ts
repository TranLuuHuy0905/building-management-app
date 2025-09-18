import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

const firestoreAdmin = admin.firestore();
const messagingAdmin = admin.messaging();

export { firestoreAdmin, messagingAdmin };
