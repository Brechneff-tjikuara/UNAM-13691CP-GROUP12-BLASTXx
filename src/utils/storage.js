import { auth, db } from "./firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit,
  updateDoc
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  IS_SETUP_COMPLETE: "blastx_is_setup_complete",
  CACHED_USER: "blastx_cache_user",
  CACHED_BLASTS: "blastx_cache_blasts",
};

export const storage = {
  // USER PROFILE with Caching to save Quota
  getUserData: async (forceRefresh = false) => {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      // Check Cache first
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(KEYS.CACHED_USER);
        if (cached) return JSON.parse(cached);
      }
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const companyDoc = await getDoc(doc(db, "companies", userData.companyCode));
        
        const fullData = {
          ...userData,
          company: companyDoc.exists() ? companyDoc.data() : null
        };

        // Update Cache
        await AsyncStorage.setItem(KEYS.CACHED_USER, JSON.stringify(fullData));
        return fullData;
      }
      return null;
    } catch (e) {
      console.error("Error getting user data", e);
      return null;
    }
  },

  updateCompanyInfo: async (companyCode, details) => {
    try {
      await setDoc(doc(db, "companies", companyCode), details, { merge: true });
      await AsyncStorage.setItem(KEYS.IS_SETUP_COMPLETE, "true");
      // Clear cache to force refresh on next load
      await AsyncStorage.removeItem(KEYS.CACHED_USER);
    } catch (e) {
      console.error("Error updating company info", e);
    }
  },

  // BLASTS / EVENTS with optimized fetching
  saveBlast: async (blast) => {
    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const companyCode = userDoc.data().companyCode;

      const newBlast = {
        ...blast,
        companyCode,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
      };

      const docRef = await addDoc(collection(db, "blasts"), newBlast);
      await AsyncStorage.removeItem(KEYS.CACHED_BLASTS);
      return { id: docRef.id, ...newBlast };
    } catch (e) {
      console.error("Error saving blast", e);
      return null;
    }
  },

  getBlasts: async (maxResults = 20) => {
    try {
      const user = auth.currentUser;
      if (!user) return [];

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const companyCode = userDoc.data().companyCode;

      const q = query(
        collection(db, "blasts"), 
        where("companyCode", "==", companyCode),
        orderBy("createdAt", "desc"),
        limit(maxResults)
      );

      const querySnapshot = await getDocs(q);
      const blasts = [];
      querySnapshot.forEach((doc) => {
        blasts.push({ id: doc.id, ...doc.data() });
      });
      return blasts;
    } catch (e) {
      console.error("Error getting blasts", e);
      return [];
    }
  },

  // TEAMMATES
  getTeammates: async () => {
    try {
      const uData = await storage.getUserData();
      if (!uData) return [];

      const q = query(
        collection(db, "users"),
        where("companyCode", "==", uData.companyCode)
      );

      const querySnapshot = await getDocs(q);
      const teammates = [];
      querySnapshot.forEach((doc) => {
        teammates.push(doc.data());
      });
      return teammates;
    } catch (e) {
      console.error("Error fetching teammates", e);
      return [];
    }
  },

  // SETUP STATE
  isSetupComplete: async () => {
    try {
      const value = await AsyncStorage.getItem(KEYS.IS_SETUP_COMPLETE);
      return value === "true";
    } catch (e) {
      return false;
    }
  },

  clearAll: async () => {
    try {
      await auth.signOut();
      await AsyncStorage.clear();
    } catch (e) {
      console.error("Error clearing storage", e);
    }
  },
};
