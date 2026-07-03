import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit as qLimit, orderBy, query, updateDoc } from "firebase/firestore";
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

function qs(f: ProviderFilters = {}) {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => v !== undefined && v !== "" && p.set(k, String(v)));
  return p.toString() ? `?${p}` : "";
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
  const db = await getFirebaseDb();
  if (!db) return localList(filters);
  try {
    const snap = await getDocs(query(collection(db, "services"), orderBy("createdAt", "desc"), qLimit(filters?.limit ?? 50)));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceProvider).filter((provider) => matches(provider, filters));
    items.forEach(upsertPublicService);
    return { items, total: items.length };
  } catch (err) {
    console.warn("Firebase services list failed; using local fallback", err);
    return localList(filters);
  }
}

export const providersService = {
  list: firestoreList,
  async get(id: string) {
    const db = await getFirebaseDb();
    if (db) {
      try {
        const snap = await getDoc(doc(db, "services", id));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as ServiceProvider;
      } catch (err) {
        console.warn("Firebase service get failed; using local fallback", err);
      }
    }
    const local = getAllLocalServices().find((provider) => provider.id === id);
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
    const db = await getFirebaseDb();
    if (db) {
      try {
        const ref = await addDoc(collection(db, "services"), draft);
        const created = { ...draft, id: ref.id };
        upsertPublicService(created);
        return created;
      } catch (err) {
        console.warn("Firebase service create failed; saving locally", err);
      }
    }
    upsertPublicService(draft);
    return draft;
  },
  async update(id: string, data: Partial<ServiceProvider>) {
    const updated = { ...data, id } as ServiceProvider;
    const db = await getFirebaseDb();
    if (db) {
      try { await updateDoc(doc(db, "services", id), data); } catch (err) { console.warn("Firebase service update failed; updating locally", err); }
    }
    upsertPublicService(updated);
    return updated;
  },
  async remove(id: string) {
    const db = await getFirebaseDb();
    if (db) {
      try { await deleteDoc(doc(db, "services", id)); } catch (err) { console.warn("Firebase service delete failed; deleting local copy", err); }
    }
    localStorage.setItem("worqgo:public_services", JSON.stringify(getAllLocalServices().filter((provider) => provider.id !== id)));
    return { ok: true as const };
  },
};
