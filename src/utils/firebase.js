import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";


// Initialize Firebase with environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Debug: Check if config is loaded (do not log sensitive keys in production)
if (!firebaseConfig.apiKey) {
  console.error("FIREBASE ERROR: API Key is missing. Check your .env file and restart the bundler.");
} else {
  console.log("Firebase Config: API Key detected (starts with " + firebaseConfig.apiKey.substring(0, 5) + ")");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with cross-platform persistence
const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' 
    ? browserLocalPersistence 
    : getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore with Persistent Cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: Platform.OS === 'web' ? persistentMultipleTabManager() : undefined
  })
});

export { auth, db };
