import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, requireFirebaseAuth, googleProvider } from "./firebase";
import type { AccountType } from "@/services/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  accountType: AccountType | null;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, fullName: string, accountType: AccountType) => Promise<void>;
  signInGoogle: (accountType?: AccountType) => Promise<void>;
  logout: () => Promise<void>;
  setAccountType: (t: AccountType) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ACCOUNT_TYPE_KEY = "worqgo:account_type";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountTypeState] = useState<AccountType | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem(ACCOUNT_TYPE_KEY) as AccountType) || null;
  });

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;

    getFirebaseAuth().then((auth) => {
      if (cancelled) return;
      if (!auth) {
        setLoading(false);
        return;
      }
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        setLoading(false);
      });
    });

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const setAccountType = (t: AccountType) => {
    localStorage.setItem(ACCOUNT_TYPE_KEY, t);
    setAccountTypeState(t);
  };

  const value: AuthContextValue = {
    user, loading, accountType,
    signInEmail: async (email, password) => {
      await signInWithEmailAndPassword(await requireFirebaseAuth(), email, password);
    },
    signUpEmail: async (email, password, fullName, t) => {
      const cred = await createUserWithEmailAndPassword(await requireFirebaseAuth(), email, password);
      await updateProfile(cred.user, { displayName: fullName });
      setAccountType(t);
    },
    signInGoogle: async (t) => {
      await signInWithPopup(await requireFirebaseAuth(), googleProvider);
      if (t) setAccountType(t);
    },
    logout: async () => {
      const auth = await getFirebaseAuth();
      if (auth) await signOut(auth);
    },
    setAccountType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
