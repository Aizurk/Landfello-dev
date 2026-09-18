import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate that required config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.warn(
    "Firebase configuration is missing required values. Please check your .env.local file."
  );
}

// Singleton pattern: Initialize Firebase ONLY ONCE
// This prevents multiple initializations in Vite + React + HMR
let app;
try {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn("Firebase configuration is missing. Please check your .env.local file.");
    // Initialize with minimal config to prevent app crash
    app = getApps().length ? getApp() : initializeApp({
      apiKey: "placeholder",
      authDomain: "placeholder.firebaseapp.com",
      projectId: "placeholder",
    });
  } else {
    // Use singleton pattern: get existing app or initialize once
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Try to get existing app
  try {
    app = getApp();
  } catch {
    // Last resort: create minimal app
    app = initializeApp({
      apiKey: "placeholder",
      authDomain: "placeholder.firebaseapp.com",
      projectId: "placeholder",
    });
  }
}

// Export singleton instances - these are created once and reused
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Log Firebase initialization status (only once)
if (typeof window !== "undefined") {
  console.log("🔥 Firebase initialized (singleton):", {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasAuth: !!auth,
    hasDb: !!db,
    appCount: getApps().length,
  });
}

// Analytics requires a real appId; skip it when config is missing so the UI still loads
export const analytics = (() => {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    return null;
  }
  try {
    return getAnalytics(app);
  } catch (error) {
    console.warn("Firebase Analytics could not be initialized:", error);
    return null;
  }
})();

