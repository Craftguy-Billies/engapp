// Thin fetch-based API client for the EngApp backend.
//
// Configuration:
//   - Base URL: read from `localStorage.engapp.apiBase`, then `import.meta.env.VITE_ENGAPP_API_BASE`,
//     defaulting to "/api" (works when the API is hosted on the same origin).
//   - Device id: persisted in localStorage and sent on every user-scoped call.
//
// All endpoints are relative to the base URL. The wrapper falls back to
// undefined when the network or the response is not OK; callers decide whether
// to surface an error toast or quietly fall back to mock data.

import type {
  AppUser,
  BookmarkRow,
  IllustrationStyle,
  KnownRow,
  UserStats,
  WordCard,
} from "./types";

const DEVICE_ID_KEY = "engapp.deviceId";
const API_BASE_KEY = "engapp.apiBase";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = uuid();
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getApiBase(): string {
  if (typeof window === "undefined") return "/api";
  const stored = window.localStorage.getItem(API_BASE_KEY);
  if (stored) return stored.replace(/\/$/, "");
  const env =
    (
      (import.meta as unknown as { env?: Record<string, string | undefined> })
        .env?.VITE_ENGAPP_API_BASE
    ) ?? "";
  if (env) return env.replace(/\/$/, "");
  return "/api";
}

export function setApiBase(url: string | null): void {
  if (typeof window === "undefined") return;
  if (url) window.localStorage.setItem(API_BASE_KEY, url.replace(/\/$/, ""));
  else window.localStorage.removeItem(API_BASE_KEY);
}

export function resolveImageUrl(relative: string | null | undefined): string | undefined {
  if (!relative) return undefined;
  if (/^https?:\/\//.test(relative)) return relative;
  const base = getApiBase().replace(/\/api$/, "");
  if (relative.startsWith("/api/")) return base + relative;
  if (relative.startsWith("/")) return base + relative;
  return `${getApiBase()}/${relative}`;
}

interface FetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

async function call<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const base = getApiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Device-Id": getDeviceId(),
  };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    credentials: "include",
  });
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText, url);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export class ApiError extends Error {
  status: number;
  url: string;
  constructor(status: number, message: string, url: string) {
    super(`${status} ${message} — ${url}`);
    this.status = status;
    this.url = url;
  }
}

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------

export const api = {
  // Public
  health: () => call<{ status: string }>("/healthz"),
  stylesList: () => call<{ styles: IllustrationStyle[] }>("/words/styles/list"),
  feed: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "" && v !== null) query.set(k, String(v));
    }
    const qs = query.toString();
    return call<{ words: WordCard[] }>(`/words/feed${qs ? `?${qs}` : ""}`);
  },
  word: (id: number) => call<WordCard>(`/words/${id}`),

  // User-scoped
  me: () => call<{ user: AppUser }>("/user/me"),
  patchMe: (patch: Partial<AppUser>) => call<{ user: AppUser }>("/user/me", { method: "PATCH", body: patch }),
  bookmarks: () => call<{ bookmarks: BookmarkRow[] }>("/user/bookmarks"),
  addBookmark: (wordId: number) => call<{ ok: true }>("/user/bookmarks", { method: "POST", body: { wordId } }),
  removeBookmark: (wordId: number) => call<{ ok: true }>(`/user/bookmarks/${wordId}`, { method: "DELETE" }),
  known: () => call<{ known: KnownRow[] }>("/user/known"),
  markKnown: (wordId: number) => call<{ ok: true; revisitAt: string }>("/user/known", { method: "POST", body: { wordId } }),
  revisit: () => call<{ revisit: KnownRow[] }>("/user/revisit"),
  markSeen: (wordId: number) => call<{ ok: true; streak: number }>("/user/seen", { method: "POST", body: { wordId } }),
  stats: () => call<UserStats>("/user/stats"),
};
