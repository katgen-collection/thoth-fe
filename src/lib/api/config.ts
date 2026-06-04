/**
 * Base URLs for the gateway. Kept dependency-free so both the REST client and
 * the auth client can import it without an import cycle.
 *
 * Everything goes through the api-gateway: thothai feature routes
 * (`/api/v1/{chat,cvs,jobs,search}`) AND the user-auth-service auth routes
 * (`/api/v1/auth/*`). `AUTH_BASE_URL` defaults to the same gateway.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const API_PREFIX = "/api/v1";

/** Gateway base for user-auth-service routes (/api/v1/auth/me|refresh|logout). */
export const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? API_BASE_URL;
