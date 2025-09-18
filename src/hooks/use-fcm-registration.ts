'use client';

import { useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { app as firebaseApp } from '@/lib/firebaseClient';
import { useAuth } from '@/contexts/auth-context';
import { saveUserFcmToken } from '@/lib/services/notification-service';

// Hướng dẫn LẤY VAPID KEY:
// 1. Mở Firebase Console > Project Settings (Cài đặt dự án).
// 2. Chuyển đến tab "Cloud Messaging".
// 3. Kéo xuống phần "Web configuration" (Cấu hình web).
// 4. Trong mục "Web Push certificates", sao chép giá trị "Key pair".
// 5. Dán giá trị đó vào tệp .env.local với tên biến NEXT_PUBLIC_FCM_VAPID_KEY.
const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;

export function useFcmRegistration() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !currentUser) {
      return;
    }
    
    if (!VAPID_KEY) {
      console.error("Firebase VAPID key is missing. Push notifications will not work.");
      return;
    }

    const messaging = getMessaging(firebaseApp);

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
                // 4. Save token to server
                await saveUserFcmToken(currentToken);
                console.log('FCM token saved to server.');
            } else {
                console.log('FCM token already exists for this user.');
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
