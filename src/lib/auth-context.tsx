import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  fetchSignInMethodsForEmail,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, requireFirebaseAuth, googleProvider } from "./firebase";
import type { AccountType } from "@/services/types";
import {
  assertRoleAvailable,
  bindRoleToEmail,
  getRoleForEmail,
  saveProfile,
} from "./local-store";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  accountType: AccountType | null;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, fullName: string, accountType: AccountType, extra?: { whatsapp?: string; city?: string }) => Promise<void>;
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
      if (!auth) { setLoading(false); return; }
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
        // Rehydrate role from email binding when signing in on a new device
        if (u?.email) {
          const bound = getRoleForEmail(u.email);
          if (bound) {
            localStorage.setItem(ACCOUNT_TYPE_KEY, bound);
            setAccountTypeState(bound);
          }
        }
        setLoading(false);
      });
    });

    return () => { cancelled = true; unsub?.(); };
  }, []);

  const setAccountType = (t: AccountType) => {
    localStorage.setItem(ACCOUNT_TYPE_KEY, t);
    setAccountTypeState(t);
  };

  const value: AuthContextValue = {
    user, loading, accountType,

    signInEmail: async (email, password) => {
      const cred = await signInWithEmailAndPassword(await requireFirebaseAuth(), email, password);
      // Always use the role bound to THIS email — never carry over a stale
      // accountType from a previous session/registration on the same device.
      const bound = getRoleForEmail(cred.user.email ?? email);
      if (bound) setAccountType(bound);
      else localStorage.removeItem(ACCOUNT_TYPE_KEY);
    },

    signUpEmail: async (email, password, fullName, t, extra) => {
      const auth = await requireFirebaseAuth();

      // Guard: one email = one account. Firebase will also enforce this,
      // but we surface a friendly message and prevent role conflicts.
      const methods = await fetchSignInMethodsForEmail(auth, email).catch(() => []);
      if (methods.length > 0) {
        throw new Error("Yeh email pehle se registered hai. Login karein ya password reset karein.");
      }
      assertRoleAvailable(email, t);

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: fullName });

      bindRoleToEmail(email, t);
      setAccountType(t);
      saveProfile(cred.user.uid, {
        fullName, email,
        whatsapp: extra?.whatsapp ?? "",
        city: extra?.city ?? "",
        country: "Pakistan",
      });
    },

    signInGoogle: async (t) => {
      const auth = await requireFirebaseAuth();
      const cred = await signInWithPopup(auth, googleProvider);
      const email = cred.user.email ?? "";
      const existing = getRoleForEmail(email);

      if (existing) {
        // Email already bound; ignore any newly-selected role and use existing.
        setAccountType(existing);
      } else if (t) {
        bindRoleToEmail(email, t);
        setAccountType(t);
      }

      // Seed profile if empty
      saveProfile(cred.user.uid, {
        fullName: cred.user.displayName ?? "",
        email,
      });
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
