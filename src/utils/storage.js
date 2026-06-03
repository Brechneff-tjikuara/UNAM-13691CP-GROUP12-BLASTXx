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
  updateDoc,
  onSnapshot
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
      const cached = await AsyncStorage.getItem(KEYS.CACHED_USER);
      if (!forceRefresh && cached) {
        // Return cached immediately, then refresh in background if needed
        return JSON.parse(cached);
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
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      console.error("Error getting user data", e);
      const cached = await AsyncStorage.getItem(KEYS.CACHED_USER);
      return cached ? JSON.parse(cached) : null;
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
      if (!user) throw new Error("User not authenticated");

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const companyCode = userDoc.data().companyCode;

      const newBlast = {
        ...blast,
        companyCode,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        createdByName: user.displayName || user.email,
      };

      // Store in company subcollection: /companies/{code}/blasts/{id}
      const docRef = await addDoc(collection(db, "companies", companyCode, "blasts"), newBlast);
      return { id: docRef.id, ...newBlast };
    } catch (e) {
      console.error("Error saving blast", e);
      return null;
    }
  },

  onBlastsUpdate: (callback, maxResults = 20) => {
    const user = auth.currentUser;
    if (!user) return () => {};

    let unsubscribe = () => {};

    // First get the user's company code
    storage.getUserData().then(uData => {
      if (!uData || !uData.companyCode) return;

      const q = query(
        collection(db, "companies", uData.companyCode, "blasts"), 
        orderBy("createdAt", "desc"),
        limit(maxResults)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const blasts = [];
        snapshot.forEach((doc) => {
          blasts.push({ id: doc.id, ...doc.data() });
        });
        // Pass metadata to callback
        callback(blasts, {
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          fromCache: snapshot.metadata.fromCache
        });
      }, (error) => {
        console.error("Error in onBlastsUpdate snapshot", error);
      });
    });

    return () => unsubscribe();
  },

  getBlasts: async (maxResults = 20) => {
    try {
      const user = auth.currentUser;
      if (!user) return [];

      const uData = await storage.getUserData();
      if (!uData) return [];

      const q = query(
        collection(db, "companies", uData.companyCode, "blasts"), 
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

  // TEAMMATES - Fetch from company subcollection
  getTeammates: async () => {
    try {
      const uData = await storage.getUserData();
      if (!uData) return [];

      const q = query(
        collection(db, "companies", uData.companyCode, "team")
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
