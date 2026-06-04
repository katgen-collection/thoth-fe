"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Login via the shared Katgen SSO popup — same flow as chat-frontend.
 *
 * Clicking opens the SSO login in a popup window pointed back at our
 * `/auth-callback` route. The SSO sets the httpOnly session cookie on the
 * shared gateway domain, then the callback navigates this window to `next`.
 */
function LoginCard() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const next = params.get("next") ?? "/chat";

  // Already signed in (cookie present, /me resolved) — skip the login screen.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const handleLogin = () => {
    const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL ?? "http://localhost:3000";
    const redirectUrl = encodeURIComponent(`${window.location.origin}/auth-callback`);

    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(
      `${ssoUrl}/login?redirect_url=${redirectUrl}`,
      "Katgen SSO",
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  };

  return (
    <div className="glass-strong w-full max-w-sm rounded-[var(--r-xl)] p-8 text-center shadow-[var(--shadow-lg)]">
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-accent text-accent-fg shadow-[0_8px_24px_var(--accent-soft)]">
        <Sparkles className="size-7" />
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight">Welcome to Thothai</h1>
      <p className="mt-2 text-sm text-muted">
        Your AI job-search assistant. Sign in to continue.
      </p>
      <button
        onClick={handleLogin}
        className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[var(--r-sm)] bg-accent text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-strong"
      >
        <ExternalLink className="size-4" /> Continue with Katgen SSO
      </button>
      <p className="mt-4 text-[11px] text-faint">
        One secure account for the entire ecosystem.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 bg-bg-0" />
      <div className="relative z-[1] flex min-h-screen items-center justify-center p-6">
        <Suspense fallback={null}>
          <LoginCard />
        </Suspense>
      </div>
    </>
  );
}
