import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

// Cache Keys Config
const KEYS = {
  IS_SETUP_COMPLETE: "blastx_is_setup_complete",
  CACHED_USER: "blastx_cache_user",
  CACHED_BLASTS: "blastx_cache_blasts",
};

export const storage = {
  // ==========================================
  // USER PROFILE & CACHING
  // ==========================================

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
          company: companyDoc.exists() ? companyDoc.data() : null,
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

  // ==========================================
  // BLASTS / EVENTS MANAGEMENT
  // ==========================================

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

    let unsubscribe = null;

    // First get the user's company code safely
    storage.getUserData().then((uData) => {
      if (!uData || !uData.companyCode) return;

      const q = query(
        collection(db, "companies", uData.companyCode, "blasts"),
        orderBy("createdAt", "desc"),
        limit(maxResults)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const blasts = [];
          snapshot.forEach((doc) => {
            blasts.push({ id: doc.id, ...doc.data() });
          });
          // Pass metadata to callback
          callback(blasts, {
            hasPendingWrites: snapshot.metadata.hasPendingWrites,
            fromCache: snapshot.metadata.fromCache,
          });
        },
        (error) => {
          console.error("Error in onBlastsUpdate snapshot", error);
        }
      );
    });

    // Clean execution handling for unmounting components
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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

  // ==========================================
  // TEAMMATES & MEMBERS MANAGEMENT
  // ==========================================

  getTeammates: async () => {
    try {
      const uData = await storage.getUserData();
      if (!uData) return [];

      const q = query(collection(db, "companies", uData.companyCode, "team"));

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

  promoteMember: async (memberUid) => {
    try {
      const uData = await storage.getUserData();
      if (!uData) return false;

      const companyCode = uData.companyCode;
      const updates = { role: "admin" };

      // Update in global users collection
      await updateDoc(doc(db, "users", memberUid), updates);
      // Update in company team subcollection
      await updateDoc(doc(db, "companies", companyCode, "team", memberUid), updates);

      return true;
    } catch (e) {
      console.error("Error promoting member", e);
      return false;
    }
  },

  demoteMember: async (memberUid) => {
    try {
      const uData = await storage.getUserData();
      if (!uData) return false;

      const companyCode = uData.companyCode;
      const updates = { role: "member" };

      await updateDoc(doc(db, "users", memberUid), updates);
      await updateDoc(doc(db, "companies", companyCode, "team", memberUid), updates);

      return true;
    } catch (e) {
      console.error("Error demoting member", e);
      return false;
    }
  },

  removeMember: async (memberUid) => {
    try {
      const uData = await storage.getUserData();
      if (!uData) return false;

      const companyCode = uData.companyCode;

      // Update user record to clear company association
      await updateDoc(doc(db, "users", memberUid), {
        companyCode: null,
        role: "member",
      });

      // Remove from company team subcollection
      await deleteDoc(doc(db, "companies", companyCode, "team", memberUid));

      return true;
    } catch (e) {
      console.error("Error removing member", e);
      return false;
    }
  },

  // ==========================================
  // CONFIGURATION / SESSION
  // ==========================================

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

  canManageBlasts: (userData) => {
    if (!userData) return false;
    // Admins always have access
    if (userData.role === "admin") return true;

    // If RBAC is disabled, everyone can manage blasts
    if (userData.company && userData.company.rbacEnabled === false) {
      return true;
    }

    const position = userData.minePosition?.toLowerCase() || "";
    const allowedKeywords = ["engineer", "analyst", "specialist"];

    return allowedKeywords.some((keyword) => position.includes(keyword));
  },

  toggleRBAC: async (companyCode, isEnabled) => {
    try {
      await updateDoc(doc(db, "companies", companyCode), { rbacEnabled: isEnabled });
      await AsyncStorage.removeItem(KEYS.CACHED_USER); // Force refresh cache
      return true;
    } catch (e) {
      console.error("Error toggling RBAC", e);
      return false;
    }
  },
};