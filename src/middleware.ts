import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth guard for the (app) route group.
 *
 * Login/registration is owned by user-auth-service; the session lives in an
 * httpOnly cookie set by the gateway. JS can't read it, but middleware (server
 * side) can check its *presence* and bounce unauthenticated users to /login.
 * Actual validation (signature/expiry) happens at the gateway on each API call.
 *
 * NOTE: token refresh + CSRF specifics are still open (see FRONTEND.md). When
 * the gateway scheme is finalized, extend this to honor the refresh cookie.
 */
const SESSION_COOKIE = process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "thothai_session";

// Routes that never require a session.
const PUBLIC_PATHS = ["/login", "/auth-callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isPublic) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);
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
