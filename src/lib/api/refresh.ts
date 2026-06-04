/**
 * Shared access-token refresh. Both the REST client (on a 401 from a thothai
 * route) and the auth client (on a 401 from /auth/me) call this. In-flight
 * calls are de-duplicated so a burst of 401s triggers a single refresh.
 *
 * Mirrors chat-frontend's `attemptRefresh`.
 */
import { AUTH_BASE_URL } from "./config";

let inFlight: Promise<boolean> | null = null;

export function attemptRefresh(): Promise<boolean> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const res = await fetch(`${AUTH_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
