import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

// Firebase publishable config — safe to expose in client code.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? import.meta.env.VITE_GOOGLE_API_KEY ?? "",
  authDomain: "worqgo.firebaseapp.com",
  projectId: "worqgo",
  storageBucket: "worqgo.firebasestorage.app",
  messagingSenderId: "299553115323",
  appId: "1:299553115323:web:4414b06a37f484b555ed9e",
  measurementId: "G-6X65JW3M3C",
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _configPromise: Promise<FirebaseOptions | null> | null = null;

function cleanApiKey(value: unknown) {
  const key = typeof value === "string" ? value.trim() : "";
  return key && !key.startsWith("@secret:") ? key : "";
}

async function loadFirebaseConfig(): Promise<FirebaseOptions | null> {
  const apiKey = cleanApiKey(firebaseConfig.apiKey);
  if (apiKey) return { ...firebaseConfig, apiKey };
  if (typeof window === "undefined") return null;

  if (!_configPromise) {
    _configPromise = fetch("/api/public/firebase-config", { headers: { Accept: "application/json" } })
      .then(async (res) => {
        if (!res.ok) return null;
        const config = (await res.json()) as FirebaseOptions;
        const fetchedApiKey = cleanApiKey(config.apiKey);
        return fetchedApiKey ? { ...config, apiKey: fetchedApiKey } : null;
      })
      .catch(() => null);
  }
  return _configPromise;
}

export const isFirebaseConfigured = Boolean(cleanApiKey(firebaseConfig.apiKey));

export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (_app) return _app;
  const config = await loadFirebaseConfig();
  if (!config) return null;
  _app = getApps()[0] ?? initializeApp(config);
  return _app;
}

export async function getFirebaseAuth(): Promise<Auth | null> {
  if (_auth) return _auth;
  const app = await getFirebaseApp();
  if (!app) return null;
  _auth = getAuth(app);
  return _auth;
}

export async function requireFirebaseAuth(): Promise<Auth> {
  const auth = await getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase is not configured. The GOOGLE_API_KEY secret or VITE_FIREBASE_API_KEY value is missing."
    );
  }
  return auth;
}

export const googleProvider = new GoogleAuthProvider();
