import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

// Firebase publishable config — safe to expose in client code.
const firebaseConfig = {
  apiKey: "AIzaSyDummyReplaceWithRealKey_worqgo",
  authDomain: "worqgo.firebaseapp.com",
  projectId: "worqgo",
  storageBucket: "worqgo.firebasestorage.app",
  messagingSenderId: "299553115323",
  appId: "1:299553115323:web:4414b06a37f484b555ed9e",
  measurementId: "G-6X65JW3M3C",
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps()[0] ?? initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

export const googleProvider = new GoogleAuthProvider();
