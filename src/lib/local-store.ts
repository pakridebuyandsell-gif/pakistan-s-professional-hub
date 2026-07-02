/**
 * Local persistence layer used as a working store while the backend
 * (VITE_API_URL) is only partially available. Keys are namespaced under
 * `worqgo:` and are per-user (bound to the Firebase UID).
 *
 * The store handles: user profile, role-per-email binding, and CRUD
 * for jobs/services that the user has posted from this device.
 */
import type { AccountType, Job, ServiceProvider } from "@/services/types";

const ROLE_MAP_KEY = "worqgo:role_by_email";
const PROFILE_PREFIX = "worqgo:profile:";
const JOBS_PREFIX = "worqgo:jobs:";
const SERVICES_PREFIX = "worqgo:services:";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

// ---------- Role binding: one email = one role forever ----------

export type RoleMap = Record<string, AccountType>;

export function getRoleMap(): RoleMap {
  if (typeof window === "undefined") return {};
  return safeParse<RoleMap>(localStorage.getItem(ROLE_MAP_KEY), {});
}

export function getRoleForEmail(email: string | null | undefined): AccountType | null {
  if (!email) return null;
  return getRoleMap()[email.toLowerCase()] ?? null;
}

export function bindRoleToEmail(email: string, role: AccountType) {
  const map = getRoleMap();
  map[email.toLowerCase()] = role;
  localStorage.setItem(ROLE_MAP_KEY, JSON.stringify(map));
}

/** Throw if this email already has a different role assigned. */
export function assertRoleAvailable(email: string, role: AccountType) {
  const existing = getRoleForEmail(email);
  if (existing && existing !== role) {
    throw new Error(
      `Yeh email pehle se "${humanRole(existing)}" account ke sath registered hai. Ek email par sirf ek hi account ban sakta hai.`
    );
  }
}

export function humanRole(t: AccountType) {
  return t === "employer" ? "Employer" :
    t === "service_provider" ? "Service Provider" :
    t === "job_seeker" ? "Job Seeker" : "Customer";
}

// ---------- User profile ----------

export interface LocalProfile {
  uid: string;
  fullName: string;
  email: string;
  whatsapp: string;
  phone?: string;
  country: string;
  city: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
  companyName?: string;
  companyWebsite?: string;
  category?: string;
  yearsExperience?: number;
  hourlyRate?: number;
  updatedAt: string;
}

export function getProfile(uid: string): LocalProfile | null {
  if (typeof window === "undefined") return null;
  return safeParse<LocalProfile | null>(localStorage.getItem(PROFILE_PREFIX + uid), null);
}

export function saveProfile(uid: string, patch: Partial<LocalProfile>) {
  const current = getProfile(uid) ?? {
    uid, fullName: "", email: "", whatsapp: "", country: "Pakistan", city: "",
    updatedAt: new Date().toISOString(),
  };
  const next: LocalProfile = { ...current, ...patch, uid, updatedAt: new Date().toISOString() };
  localStorage.setItem(PROFILE_PREFIX + uid, JSON.stringify(next));
  return next;
}

// ---------- Jobs owned by the current employer ----------

export function getMyJobs(uid: string): Job[] {
  if (typeof window === "undefined") return [];
  return safeParse<Job[]>(localStorage.getItem(JOBS_PREFIX + uid), []);
}

export function saveMyJob(uid: string, job: Job) {
  const list = getMyJobs(uid);
  const idx = list.findIndex((j) => j.id === job.id);
  if (idx >= 0) list[idx] = job; else list.unshift(job);
  localStorage.setItem(JOBS_PREFIX + uid, JSON.stringify(list));
  return list;
}

export function deleteMyJob(uid: string, id: string) {
  const list = getMyJobs(uid).filter((j) => j.id !== id);
  localStorage.setItem(JOBS_PREFIX + uid, JSON.stringify(list));
  return list;
}

// ---------- Services owned by the current provider ----------

export function getMyServices(uid: string): ServiceProvider[] {
  if (typeof window === "undefined") return [];
  return safeParse<ServiceProvider[]>(localStorage.getItem(SERVICES_PREFIX + uid), []);
}

export function saveMyService(uid: string, svc: ServiceProvider) {
  const list = getMyServices(uid);
  const idx = list.findIndex((s) => s.id === svc.id);
  if (idx >= 0) list[idx] = svc; else list.unshift(svc);
  localStorage.setItem(SERVICES_PREFIX + uid, JSON.stringify(list));
  return list;
}

export function deleteMyService(uid: string, id: string) {
  const list = getMyServices(uid).filter((s) => s.id !== id);
  localStorage.setItem(SERVICES_PREFIX + uid, JSON.stringify(list));
  return list;
}

export function newId() {
  return (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
