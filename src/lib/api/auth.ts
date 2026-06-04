/**
 * Client for the user-auth-service routes (served by the gateway under
 * `/api/v1/auth/*`). These use the ecosystem `{ok, data, error}` envelope —
 * different from the thothai backend — so they get their own thin client
 * rather than going through `apiFetch`. Mirrors chat-frontend's `authApi`.
 */
import { AUTH_BASE_URL } from "./config";
import { ApiError } from "./client";
import { attemptRefresh } from "./refresh";
import { userSchema, type User } from "@/types/auth";

interface Envelope<T> {
  ok?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function authRequest<T>(
  path: string,
  init: RequestInit,
  allowRetry = true,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${AUTH_BASE_URL}${path}`, { credentials: "include", ...init });
  } catch (err) {
    throw new ApiError(0, "Network error — could not reach the auth service", err);
  }

  if (res.status === 401 && allowRetry) {
    const refreshed = await attemptRefresh();
    if (refreshed) return authRequest<T>(path, init, false);
  }

  const json = (await res.json().catch(() => null)) as Envelope<T> | null;

  if (!res.ok || json?.ok === false) {
    throw new ApiError(
      res.status,
      json?.error ?? json?.message ?? `Request failed (${res.status})`,
      json,
    );
  }

  // Unwrap the envelope; tolerate a bare body just in case.
  return (json?.data ?? (json as unknown)) as T;
}

/** Current user from the session cookie. Throws ApiError(401) if signed out. */
export async function fetchMe(): Promise<User> {
  const raw = await authRequest<unknown>("/api/v1/auth/me", { method: "GET" });
  return userSchema.parse(raw);
}

/** End the session. Best-effort — never throws. */
export async function logout(): Promise<void> {
  try {
    await authRequest<unknown>("/api/v1/auth/logout", { method: "POST" }, false);
  } catch {
    // Swallow — the caller clears client state regardless.
  }
}
