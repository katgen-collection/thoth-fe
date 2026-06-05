import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth guard for the (app) route group.
 *
 * Login/registration is owned by user-auth-service, which sets two httpOnly
 * cookies: a short-lived `access_token` (~30 min) and a long-lived
 * `refresh_token` (~30 days). JS can't read them, but middleware (server side)
 * can check their *presence*. Actual validation happens at the gateway per call.
 *
 * IMPORTANT: we must NOT bounce to /login just because the access token expired
 * — the client transparently refreshes it from the still-valid refresh token
 * (see lib/api/refresh.ts + AuthContext). Bouncing on access-cookie expiry was
 * the cause of "logged out after a few minutes". So a request is allowed through
 * as long as EITHER auth cookie is present; we only redirect when the user has
 * no session at all.
 */
const SESSION_COOKIE = process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "access_token";
const REFRESH_COOKIE = process.env.NEXT_PUBLIC_REFRESH_COOKIE ?? "refresh_token";

// Routes that never require a session.
const PUBLIC_PATHS = ["/login", "/auth-callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isPublic) return NextResponse.next();

  // The refresh token (long-lived) is the real "is this user signed in" signal;
  // the access token may have lapsed and is about to be refreshed client-side.
  const hasSession =
    request.cookies.has(REFRESH_COOKIE) || request.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Guard everything except Next internals, static assets, and the auth pages.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login|auth-callback|.*\\..*).*)"],
};
