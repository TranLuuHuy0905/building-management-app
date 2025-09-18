// This file must be in the public folder.

import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqntKvNJVxanSqrh6oVSYzMPkJVKrRu_U",
  authDomain: "studio-5272753681-9a392.firebaseapp.com",
  projectId: "studio-5272753681-9a392",
  storageBucket: "studio-5272753681-9a392.appspot.com",
  messagingSenderId: "364205339047",
  appId: "1:364205339047:web:c8437fc87262deacb34682"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // Optional: you can add an icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
