import { initializeApp } from 'firebase/app';
// @ts-ignore - getReactNativePersistence is missing from type definitions but exists at runtime
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyDqRe1qPxPfgxYiGd0UKn7lkSA0LgcYdRs",
  authDomain: "trawell-88827.firebaseapp.com",
  projectId: "trawell-88827",
  storageBucket: "trawell-88827.firebasestorage.app",
  messagingSenderId: "34587585150",
  appId: "1:34587585150:web:b87a4fb15c04eb4d51862f",
  measurementId: "G-X4578X6TP8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
