import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG FROM CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyBcHy_ee5Vwd8qht2lx6yoov1b0Wq91IEU",
  authDomain: "project-b6381ba6-25b7-4169-8c5.firebaseapp.com",
  databaseURL: "https://project-b6381ba6-25b7-4169-8c5-default-rtdb.firebaseio.com",
  projectId: "project-b6381ba6-25b7-4169-8c5",
  storageBucket: "project-b6381ba6-25b7-4169-8c5.firebasestorage.app",
  messagingSenderId: "427442428387",
  appId: "1:427442428387:web:47ba0aaab53f9075d068d6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
