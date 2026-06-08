import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, initializeAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { Platform } from "react-native";


// Initialize Firebase with environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCR1ecOkEiBdkamGDl1aIWoOhuLdy54XRU",
  authDomain: "my-blastx-text.firebaseapp.com",
  projectId: "my-blastx-text",
  storageBucket: "my-blastx-text.firebasestorage.app",
  messagingSenderId: "256290661203",
  appId: "1:256290661203:web:7fd8d85145f73a379537a6",
  measurementId: "G-6ZMFTSD68N"
};

// Debug: Check if config is loaded (do not log sensitive keys in production)
if (!firebaseConfig.apiKey) {
  console.error("FIREBASE ERROR: API Key is missing. Check your .env file and restart the bundler.");
} else {
  console.log("Firebase Config: API Key detected (starts with " + firebaseConfig.apiKey.substring(0, 5) + ")");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: browserLocalPersistence
});

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { auth, db };