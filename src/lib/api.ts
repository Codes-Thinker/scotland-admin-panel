/**
 * Client for the Fife Nearby Taxis API (scotland-backend).
 *
 * Session: the access token lives in memory and the refresh token in sessionStorage, so a
 * reload keeps the admin signed in and closing the tab ends the session. A production
 * deployment should move the refresh token to an HTTP-only cookie behind a same-site proxy.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

const SESSION_KEY = "fnt-admin-session";

export type ApiRole = "passenger" | "driver" | "admin";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: ApiRole[];
  status: string;
}

interface Session {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let session: Session | null = null;
let sessionLoaded = false;

function readStored(): Session | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function store(next: Session | null): void {
  session = next;
  try {
    if (next) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage can be blocked; the session then lasts only for this page view.
  }
}

/** Returns the signed-in admin, or null. Safe to call on the server (returns null). */
export function currentUser(): ApiUser | null {
  if (typeof window === "undefined") return null;
  if (!sessionLoaded) {
    session = readStored();
    sessionLoaded = true;
  }
  return session?.user ?? null;
}

function bearer(): string | undefined {
  return session?.accessToken;
}

async function parseError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
  const message = Array.isArray(body.message)
    ? body.message.join(" ")
    : (body.message ?? res.statusText ?? "Request failed");
  return new ApiError(res.status, message);
}

async function refresh(): Promise<boolean> {
  const current = session;
  if (!current) return false;
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: current.refreshToken }),
  });
  if (!res.ok) {
    store(null);
    return false;
  }
  const body = (await res.json()) as { accessToken: string; refreshToken: string };
  store({ ...current, accessToken: body.accessToken, refreshToken: body.refreshToken });
  return true;
}

/** Calls the API as the signed-in admin. Retries once after refreshing an expired access token. */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const send = () =>
    fetch(`${API_URL}${path}`, {
      method: init.method ?? "GET",
      headers: {
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(bearer() ? { Authorization: `Bearer ${bearer()}` } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });

  let res = await send();
  if (res.status === 401 && session && (await refresh())) {
    res = await send();
  }
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Downloads an uploaded driver document with the admin's token, returning a local object URL. */
export async function documentUrl(driverId: string, type: string): Promise<string> {
  const path = `/admin/drivers/${driverId}/documents/${type}/file`;
  const send = () =>
    fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${bearer() ?? ""}` } });
  let res = await send();
  if (res.status === 401 && (await refresh())) res = await send();
  if (!res.ok) throw await parseError(res);
  return URL.createObjectURL(await res.blob());
}

export async function login(email: string, password: string): Promise<ApiUser> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await parseError(res);
  const body = (await res.json()) as { accessToken: string; refreshToken: string; user: ApiUser };
  if (!body.user.roles.includes("admin")) {
    throw new ApiError(403, "This account does not have operations access.");
  }
  store({ accessToken: body.accessToken, refreshToken: body.refreshToken, user: body.user });
  return body.user;
}

export async function logout(): Promise<void> {
  const current = session;
  store(null);
  if (current) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    }).catch(() => undefined);
  }
}

/** Shape of a paged response from the API. */
export interface Paged<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
