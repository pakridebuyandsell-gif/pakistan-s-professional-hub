import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit as qLimit, orderBy, query, updateDoc } from "firebase/firestore";
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

function qs(f: JobFilters = {}) {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => v !== undefined && v !== "" && p.set(k, String(v)));
  return p.toString() ? `?${p}` : "";
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
  const db = await getFirebaseDb();
  if (!db) return localList(filters);
  try {
    const snap = await getDocs(query(collection(db, "jobs"), orderBy("postedAt", "desc"), qLimit(filters?.limit ?? 50)));
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Job).filter((job) => matches(job, filters));
    items.forEach(upsertPublicJob);
    return { items, total: items.length };
  } catch (err) {
    console.warn("Firebase jobs list failed; using local fallback", err);
    return localList(filters);
  }
}

export const jobsService = {
  list: firestoreList,
  async get(id: string) {
    const db = await getFirebaseDb();
    if (db) {
      try {
        const snap = await getDoc(doc(db, "jobs", id));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as Job;
      } catch (err) {
        console.warn("Firebase job get failed; using local fallback", err);
      }
    }
    const local = getAllLocalJobs().find((job) => job.id === id);
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
    const db = await getFirebaseDb();
    if (db) {
      try {
        const ref = await addDoc(collection(db, "jobs"), draft);
        const created = { ...draft, id: ref.id };
        upsertPublicJob(created);
        return created;
      } catch (err) {
        console.warn("Firebase job create failed; saving locally", err);
      }
    }
    upsertPublicJob(draft);
    return draft;
  },
  async update(id: string, data: Partial<Job>) {
    const updated = { ...data, id } as Job;
    const db = await getFirebaseDb();
    if (db) {
      try { await updateDoc(doc(db, "jobs", id), data); } catch (err) { console.warn("Firebase job update failed; updating locally", err); }
    }
    upsertPublicJob(updated);
    return updated;
  },
  async remove(id: string) {
    const db = await getFirebaseDb();
    if (db) {
      try { await deleteDoc(doc(db, "jobs", id)); } catch (err) { console.warn("Firebase job delete failed; deleting local copy", err); }
    }
    localStorage.setItem("worqgo:public_jobs", JSON.stringify(getAllLocalJobs().filter((job) => job.id !== id)));
    return { ok: true as const };
  },
  async apply(_id: string, _data: { message?: string; resumeUrl?: string }) {
    return { ok: true as const };
  },
};
