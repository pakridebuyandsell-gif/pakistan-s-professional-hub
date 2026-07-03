import { collection, deleteDoc, doc, getDoc, getDocs, limit as qLimit, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { getAllLocalServices, newId, upsertPublicService } from "@/lib/local-store";
import type { ServiceProvider } from "./types";

export interface ProviderFilters {
  q?: string;
  city?: string;
  category?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}

let firestoreEnabledForSession = true;

function rememberFirestoreFailure(err: unknown) {
  const message = err instanceof Error ? err.message : String(err ?? "");
  if (/permission|disabled|unavailable|failed-precondition|not-found|api/i.test(message)) {
    firestoreEnabledForSession = false;
  }
}

async function optionalDb() {
  if (!firestoreEnabledForSession || typeof window === "undefined") return null;
  try {
    return await getFirebaseDb();
  } catch (err) {
    rememberFirestoreFailure(err);
    console.warn("Firebase services unavailable; using browser storage", err);
    return null;
  }
}

function matches(provider: ServiceProvider, filters: ProviderFilters = {}) {
  const haystack = `${provider.name} ${provider.category} ${provider.city} ${provider.description} ${provider.tags?.join(" ") ?? ""}`.toLowerCase();
  const q = filters.q?.trim().toLowerCase();
  if (q && !haystack.includes(q)) return false;
  if (filters.city && provider.city !== filters.city) return false;
  if (filters.category && provider.category !== filters.category) return false;
  if (filters.minRating && provider.rating < filters.minRating) return false;
  return true;
}

function localList(filters?: ProviderFilters) {
  const items = getAllLocalServices()
    .filter((provider) => matches(provider, filters))
    .sort((a, b) => (b.rating - a.rating) || (b.reviews - a.reviews))
    .slice(0, filters?.limit ?? 50);
  return { items, total: items.length };
}

async function firestoreList(filters?: ProviderFilters) {
  const db = await optionalDb();
  if (!db) return localList(filters);
  try {
    const snap = await getDocs(query(collection(db, "services"), orderBy("createdAt", "desc"), qLimit(filters?.limit ?? 50)));
    const firebaseItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceProvider);
    firebaseItems.forEach(upsertPublicService);
    const merged = new Map<string, ServiceProvider>();
    [...firebaseItems, ...getAllLocalServices()].forEach((provider) => merged.set(provider.id, provider));
    const items = [...merged.values()]
      .filter((provider) => matches(provider, filters))
      .sort((a, b) => (b.rating - a.rating) || (b.reviews - a.reviews))
      .slice(0, filters?.limit ?? 50);
    return { items, total: items.length };
  } catch (err) {
    rememberFirestoreFailure(err);
    console.warn("Firebase services list failed; using local fallback", err);
    return localList(filters);
  }
}

async function syncServiceCreate(service: ServiceProvider) {
  const db = await optionalDb();
  if (!db) return;
  try {
    await setDoc(doc(db, "services", service.id), service, { merge: true });
  } catch (err) {
    rememberFirestoreFailure(err);
    console.warn("Firebase service sync failed; kept locally", err);
  }
}

export const providersService = {
  list: firestoreList,
  async get(id: string) {
    const local = getAllLocalServices().find((provider) => provider.id === id);
    const db = await optionalDb();
    if (db) {
      try {
        const snap = await getDoc(doc(db, "services", id));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as ServiceProvider;
      } catch (err) {
        rememberFirestoreFailure(err);
        console.warn("Firebase service get failed; using local fallback", err);
      }
    }
    if (!local) throw new Error("Service not found");
    return local;
  },
  async create(data: Partial<ServiceProvider>) {
    const draft = {
      ...data,
      id: data.id ?? newId(),
      rating: data.rating ?? 0,
      reviews: data.reviews ?? 0,
      level: data.level ?? "Bronze",
      verified: data.verified ?? false,
      createdAt: (data as { createdAt?: string }).createdAt ?? new Date().toISOString(),
    } as ServiceProvider & { createdAt: string };
    upsertPublicService(draft);
    void syncServiceCreate(draft);
    return draft;
  },
  async update(id: string, data: Partial<ServiceProvider>) {
    const updated = { ...data, id } as ServiceProvider;
    upsertPublicService(updated);
    void optionalDb().then(async (db) => {
      if (!db) return;
      try { await updateDoc(doc(db, "services", id), data); } catch (err) { rememberFirestoreFailure(err); console.warn("Firebase service update failed; updated locally", err); }
    });
    return updated;
  },
  async remove(id: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("worqgo:public_services", JSON.stringify(getAllLocalServices().filter((provider) => provider.id !== id)));
    }
    void optionalDb().then(async (db) => {
      if (!db) return;
      try { await deleteDoc(doc(db, "services", id)); } catch (err) { rememberFirestoreFailure(err); console.warn("Firebase service delete failed; deleted local copy", err); }
    });
    return { ok: true as const };
  },
};
