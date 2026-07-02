import { api } from "./api";
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

export const providersService = {
  list: (filters?: ProviderFilters) =>
    api.get<{ items: ServiceProvider[]; total: number }>(`/api/services${qs(filters)}`, { auth: false }),
  get: (id: string) => api.get<ServiceProvider>(`/api/services/${id}`, { auth: false }),
  create: (data: Partial<ServiceProvider>) => api.post<ServiceProvider>("/api/services", data),
  update: (id: string, data: Partial<ServiceProvider>) => api.put<ServiceProvider>(`/api/services/${id}`, data),
  remove: (id: string) => api.delete<{ ok: true }>(`/api/services/${id}`),
};
