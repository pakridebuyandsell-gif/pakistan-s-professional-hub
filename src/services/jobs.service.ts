import { collection, deleteDoc, doc, getDoc, getDocs, limit as qLimit, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { getAllLocalJobs, newId, upsertPublicJob } from "@/lib/local-store";
import type { Job } from "./types";

export interface JobFilters {
  q?: string;
  city?: string;
  category?: string;
  type?: string;
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
    console.warn("Firebase jobs unavailable; using browser storage", err);
    return null;
  }
}

function matches(job: Job, filters: JobFilters = {}) {
  const haystack = `${job.title} ${job.company} ${job.category} ${job.city} ${job.location} ${job.tags?.join(" ") ?? ""}`.toLowerCase();
  const q = filters.q?.trim().toLowerCase();
  if (q && !haystack.includes(q)) return false;
  if (filters.city && job.city !== filters.city && !job.location.toLowerCase().includes(filters.city.toLowerCase())) return false;
  if (filters.category && job.category !== filters.category) return false;
  if (filters.type && job.employmentType !== filters.type) return false;
  return true;
}

function localList(filters?: JobFilters) {
  const items = getAllLocalJobs()
    .filter((job) => matches(job, filters))
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
    .slice(0, filters?.limit ?? 50);
  return { items, total: items.length };
}

async function firestoreList(filters?: JobFilters) {
  const db = await optionalDb();
  if (!db) return localList(filters);
  try {
    const snap = await getDocs(query(collection(db, "jobs"), orderBy("postedAt", "desc"), qLimit(filters?.limit ?? 50)));
    const firebaseItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Job);
    firebaseItems.forEach(upsertPublicJob);
    const merged = new Map<string, Job>();
    [...firebaseItems, ...getAllLocalJobs()].forEach((job) => merged.set(job.id, job));
    const items = [...merged.values()]
      .filter((job) => matches(job, filters))
      .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
      .slice(0, filters?.limit ?? 50);
    return { items, total: items.length };
  } catch (err) {
    rememberFirestoreFailure(err);
    console.warn("Firebase jobs list failed; using local fallback", err);
    return localList(filters);
  }
}

async function syncJobCreate(job: Job) {
  const db = await optionalDb();
  if (!db) return;
  try {
    await setDoc(doc(db, "jobs", job.id), job, { merge: true });
  } catch (err) {
    rememberFirestoreFailure(err);
    console.warn("Firebase job sync failed; kept locally", err);
  }
}

export const jobsService = {
  list: firestoreList,
  async get(id: string) {
    const local = getAllLocalJobs().find((job) => job.id === id);
    const db = await optionalDb();
    if (db) {
      try {
        const snap = await getDoc(doc(db, "jobs", id));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as Job;
      } catch (err) {
        rememberFirestoreFailure(err);
        console.warn("Firebase job get failed; using local fallback", err);
      }
    }
    if (!local) throw new Error("Job not found");
    return local;
  },
  async create(data: Partial<Job>) {
    const draft = {
      ...data,
      id: data.id ?? newId(),
      postedAt: data.postedAt ?? new Date().toISOString(),
      isNew: data.isNew ?? true,
      verified: data.verified ?? false,
    } as Job;
    upsertPublicJob(draft);
    void syncJobCreate(draft);
    return draft;
  },
  async update(id: string, data: Partial<Job>) {
    const updated = { ...data, id } as Job;
    upsertPublicJob(updated);
    void optionalDb().then(async (db) => {
      if (!db) return;
      try { await updateDoc(doc(db, "jobs", id), data); } catch (err) { rememberFirestoreFailure(err); console.warn("Firebase job update failed; updated locally", err); }
    });
    return updated;
  },
  async remove(id: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("worqgo:public_jobs", JSON.stringify(getAllLocalJobs().filter((job) => job.id !== id)));
    }
    void optionalDb().then(async (db) => {
      if (!db) return;
      try { await deleteDoc(doc(db, "jobs", id)); } catch (err) { rememberFirestoreFailure(err); console.warn("Firebase job delete failed; deleted local copy", err); }
    });
    return { ok: true as const };
  },
  async apply(_id: string, _data: { message?: string; resumeUrl?: string }) {
    return { ok: true as const };
  },
};
