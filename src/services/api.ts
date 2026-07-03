/**
 * Legacy REST helper kept for future external integrations.
 * The marketplace itself uses Firebase + Cloudinary now.
 */
import { getFirebaseAuth } from "@/lib/firebase";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(public status: number, message: string, public payload?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

async function authHeader(): Promise<Record<string, string>> {
  try {
    const auth = await getFirebaseAuth();
    const user = auth?.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

type Options = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
};

export async function apiFetch<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { body, headers = {}, auth = true, ...rest } = opts;
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    ...(auth ? await authHeader() : {}),
    ...headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message: unknown }).message)
        : res.statusText) || "Request failed",
      payload,
    );
  }
  return payload as T;
}

export const api = {
  get: <T>(p: string, o?: Options) => apiFetch<T>(p, { ...o, method: "GET" }),
  post: <T>(p: string, body?: unknown, o?: Options) => apiFetch<T>(p, { ...o, method: "POST", body }),
  put: <T>(p: string, body?: unknown, o?: Options) => apiFetch<T>(p, { ...o, method: "PUT", body }),
  patch: <T>(p: string, body?: unknown, o?: Options) => apiFetch<T>(p, { ...o, method: "PATCH", body }),
  delete: <T>(p: string, o?: Options) => apiFetch<T>(p, { ...o, method: "DELETE" }),
};
