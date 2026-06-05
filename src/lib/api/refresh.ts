/**
 * Shared access-token refresh. Both the REST client (on a 401 from a thothai
 * route) and the auth client (on a 401 from /auth/me) call this.
 *
 * The auth service issues ROTATING, single-use refresh tokens with reuse
 * detection: presenting an already-rotated token deletes the session and clears
 * the cookies. The refresh_token cookie is shared across every *.katgen.pro app,
 * so uncoordinated refreshes (a timer + a tab-focus + several 401s, or two open
 * apps) can race and trip reuse-detection — a spurious hard logout.
 *
 * To stay safe we collapse bursts two ways:
 *  - in-flight de-duplication: concurrent callers share one request;
 *  - a short success cooldown: a refresh that just succeeded is treated as still
 *    fresh, so a follow-up trigger returns true WITHOUT rotating again.
 */
import { AUTH_BASE_URL } from "./config";

// A successful rotation keeps the access token valid for ~30 min, so treating a
// just-refreshed token as fresh for a few seconds collapses bursts to a single
// rotation without ever serving a stale token.
const SUCCESS_TTL_MS = 15_000;

let inFlight: Promise<boolean> | null = null;
let lastSuccessAt = 0;

export function attemptRefresh(): Promise<boolean> {
  if (inFlight) return inFlight;
  if (Date.now() - lastSuccessAt < SUCCESS_TTL_MS) return Promise.resolve(true);

  inFlight = (async () => {
    try {
      const res = await fetch(`${AUTH_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) lastSuccessAt = Date.now();
      return res.ok;
    } catch {
      return false;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
