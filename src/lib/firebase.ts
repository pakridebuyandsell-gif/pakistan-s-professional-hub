import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

// Firebase publishable config — safe to expose in client code.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: "worqgo.firebaseapp.com",
  projectId: "worqgo",
  storageBucket: "worqgo.firebasestorage.app",
  messagingSenderId: "299553115323",
  appId: "1:299553115323:web:4414b06a37f484b555ed9e",
  measurementId: "G-6X65JW3M3C",
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (_app) return _app;
  _app = getApps()[0] ?? initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured) return null;
  if (_auth) return _auth;
  const app = getFirebaseApp();
  if (!app) return null;
  _auth = getAuth(app);
  return _auth;
}

export function requireFirebaseAuth(): Auth {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase is not configured. Add VITE_FIREBASE_API_KEY to your .env file (get it from Firebase Console → Project Settings → General → Your apps → Web app → apiKey)."
    );
  }
  return auth;
}

export const googleProvider = new GoogleAuthProvider();
