import * as admin from 'firebase-admin';

// Ensure you have the GOOGLE_APPLICATION_CREDENTIALS environment variable set
// pointing to your service account key file.

const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? JSON.parse(Buffer.from(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'base64').toString('ascii'))
  : undefined;


if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

const firestoreAdmin = admin.firestore();
const messagingAdmin = admin.messaging();
const authAdmin = admin.auth();


export { firestoreAdmin, messagingAdmin, authAdmin };
