import * as admin from 'firebase-admin';

// This guard prevents re-initializing the app in hot-reload environments.
if (!admin.apps.length) {
  try {
    // When deployed to a Google Cloud environment (e.g., Cloud Functions, App Engine),
    // the SDK automatically discovers the service account credentials.
    // For local development, you must set the GOOGLE_APPLICATION_CREDENTIALS
    // environment variable in your .env.local file.
    // Example: GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
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
