import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';
import { Platform } from 'react-native';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase with platform-specific credentials
const firebaseConfig = {
  apiKey:
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_IOS_API_KEY
      : Platform.OS === 'android'
        ? process.env.EXPO_PUBLIC_ANDROID_API_KEY
        : process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
  appId:
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_IOS_APP_ID
      : Platform.OS === 'android'
        ? process.env.EXPO_PUBLIC_ANDROID_APP_ID
        : process.env.EXPO_PUBLIC_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firebase Functions servisini başlat
const functions = getFunctions(app);

// Geliştirme ortamında emülatör kullanmak isterseniz
// connectFunctionsEmulator(functions, "localhost", 5001);

// Firebase servislerini export et
export { app, functions };

// Geriye dönük uyumluluk için default export
export default app;
