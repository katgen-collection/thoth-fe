/**
 * One typed fetch wrapper for every REST call.
 *
 * - Always sends `credentials: 'include'` — auth is an httpOnly session cookie
 *   set by the gateway, so there is no Authorization header to attach here.
 * - Prefixes the gateway base URL + `/api/v1`.
 * - Unwraps the `{items: [...]}` list convention and the `{error: "..."}` error
 *   convention, mapping statuses to typed errors the UI can branch on.
 * - Validates responses against the zod schemas in `types/api.ts` when a schema
 *   is provided, so a drifting backend fails loudly instead of silently.
 */
import type { z } from "zod";
import { API_BASE_URL, API_PREFIX } from "./config";
import { attemptRefresh } from "./refresh";

export { API_BASE_URL, API_PREFIX };

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isNotFound() {
    return this.status === 404;
  }
  /** 413 (too large) / 422 (validation) / 403 (quota) — surface on forms. */
  get isFormError() {
    return this.status === 413 || this.status === 422 || this.status === 403;
  }
}

export interface RequestOptions<T> extends Omit<RequestInit, "body"> {
  /** JSON body (serialized automatically). Use `formData` for multipart. */
  json?: unknown;
  /** Raw body for multipart uploads (FormData). */
  formData?: FormData;
  /** Zod schema to validate + type the JSON response. */
  schema?: z.ZodType<T>;
  /** Query params appended to the URL. */
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: RequestOptions<unknown>["query"]): string {
  const url = new URL(API_BASE_URL + API_PREFIX + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/** Redirect to login on 401 (browser only). Kept here so every call benefits. */
function handleUnauthorized() {
  if (typeof window === "undefined") return;
  const loginUrl = process.env.NEXT_PUBLIC_AUTH_LOGIN_URL ?? "/login";
  // Preserve where the user wanted to go.
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  const sep = loginUrl.includes("?") ? "&" : "?";
  window.location.href = `${loginUrl}${sep}next=${next}`;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions<T> = {},
): Promise<T> {
  const { json, formData, schema, query, headers, ...rest } = options;

  const init: RequestInit = {
    credentials: "include",
    ...rest,
    headers: {
      Accept: "application/json",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  };
  if (json !== undefined) init.body = JSON.stringify(json);
  if (formData !== undefined) init.body = formData;

  const url = buildUrl(path, query);
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    throw new ApiError(0, "Network error — could not reach the server", err);
  }

  // On 401, attempt a single token refresh and retry once before giving up —
  // same scheme as chat-frontend, so a silently-expired access token recovers
  // without bouncing the user to /login.
  if (response.status === 401) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      try {
        response = await fetch(url, init);
      } catch (err) {
        throw new ApiError(0, "Network error — could not reach the server", err);
      }
    }
  }

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError(401, "Unauthorized");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (isJson && payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : null) ?? `Request failed (${response.status})`;
    throw new ApiError(response.status, message, payload);
  }

  if (schema) {
    const result = schema.safeParse(payload);
    if (!result.success) {
      throw new ApiError(
        response.status,
        "Response did not match the expected shape",
        result.error.flatten(),
      );
    }
    return result.data;
  }

  return payload as T;
}

/** Build a full gateway URL for non-fetch uses (SSE POST, redirects). */
export function apiUrl(path: string): string {
  return API_BASE_URL + API_PREFIX + path;
}
