'use client';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqntKvNJVxanSqrh6oVSYzMPkJVKrRu_U",
  authDomain: "studio-5272753681-9a392.firebaseapp.com",
  projectId: "studio-5272753681-9a392",
  storageBucket: "studio-5272753681-9a392.appspot.com",
  messagingSenderId: "364205339047",
  appId: "1:364205339047:web:c8437fc87262deacb34682"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
