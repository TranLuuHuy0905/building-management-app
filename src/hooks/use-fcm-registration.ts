'use client';

import { useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging } from '@/lib/firebaseClient';
import { useAuth } from '@/contexts/auth-context';
import { saveUserFcmToken } from '@/lib/services/notification-service';

// This VAPID key is a placeholder. You need to replace it with your actual key.
const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;

export function useFcmRegistration() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !currentUser || !messaging) {
      return;
    }
    
    if (!VAPID_KEY) {
      console.error("Firebase VAPID key is missing. Push notifications will not work.");
      return;
    }

    const requestPermissionAndGetToken = async () => {
      try {
        // 1. Request permission
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('Notification permission granted.');

          // 2. Get token
          const currentToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
          });

          if (currentToken) {
            // 3. Check if token already exists for the user to avoid unnecessary writes
            const userTokens = currentUser.fcmTokens || [];
            if (!userTokens.includes(currentToken)) {
                // 4. Save token to server by calling the Server Action
                await saveUserFcmToken(currentToken);
                console.log('FCM token sent to server for saving.');
                // Note: We don't update the local currentUser state here.
                // The source of truth is Firestore. The local state will be updated
                // on the next full page load or when the auth state changes.
            } else {
                console.log('FCM token already registered for this user.');
            }
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    requestPermissionAndGetToken();

  }, [currentUser]); // Re-run when user logs in
}