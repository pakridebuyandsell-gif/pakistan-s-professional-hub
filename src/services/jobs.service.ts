import { api } from "./api";
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

export const jobsService = {
  list: (filters?: JobFilters) => api.get<{ items: Job[]; total: number }>(`/api/jobs${qs(filters)}`, { auth: false }),
  get: (id: string) => api.get<Job>(`/api/jobs/${id}`, { auth: false }),
  create: (data: Partial<Job>) => api.post<Job>("/api/jobs", data),
  update: (id: string, data: Partial<Job>) => api.put<Job>(`/api/jobs/${id}`, data),
  remove: (id: string) => api.delete<{ ok: true }>(`/api/jobs/${id}`),
  apply: (id: string, data: { message?: string; resumeUrl?: string }) =>
    api.post<{ ok: true }>(`/api/jobs/${id}/apply`, data),
};
