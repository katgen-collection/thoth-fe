"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Search,
  FileText,
  Target,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Login via the shared Katgen SSO popup — same flow as chat-frontend.
 *
 * Clicking opens the SSO login in a popup window pointed back at our
 * `/auth-callback` route. The SSO sets the httpOnly session cookie on the
 * shared gateway domain, then the callback navigates this window to `next`.
 */

const FEATURES = [
  { icon: Search, title: "Find roles", sub: "AI-ranked job matches" },
  { icon: Target, title: "Match your CV", sub: "Score fit vs. any posting" },
  { icon: FileText, title: "Tailor & apply", sub: "Cover letters in seconds" },
];

function AuroraBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-bg-0">
      <div
        className="aurora-blob left-[-10%] top-[-15%] size-[55vw]"
        style={{ background: "oklch(0.62 0.16 280 / 0.5)", animationDelay: "0s" }}
      />
      <div
        className="aurora-blob right-[-12%] top-[10%] size-[48vw]"
        style={{ background: "oklch(0.68 0.15 200 / 0.45)", animationDelay: "-6s" }}
      />
      <div
        className="aurora-blob bottom-[-18%] left-[25%] size-[50vw]"
        style={{ background: "oklch(0.66 0.17 340 / 0.4)", animationDelay: "-11s" }}
      />
      {/* fine grain to keep the gradient from banding */}
      <div className="absolute inset-0 opacity-[0.4] [background:radial-gradient(circle_at_center,transparent_55%,var(--bg-0))]" />
    </div>
  );
}

function LoginCard() {
  const params = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const next = params.get("next") ?? "/chat";
  const [connecting, setConnecting] = useState(false);

  // Already signed in (cookie present, /me resolved) — skip the login screen.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const handleLogin = () => {
    setConnecting(true);
    const ssoUrl = process.env.NEXT_PUBLIC_SSO_URL ?? "http://localhost:3000";
    const redirectUrl = encodeURIComponent(`${window.location.origin}/auth-callback`);

    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `${ssoUrl}/login?redirect_url=${redirectUrl}`,
      "Katgen SSO",
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    // If the popup is closed without finishing, let the user try again.
    const poll = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(poll);
        setConnecting(false);
      }
    }, 600);
  };

  return (
    <div className="rise glass-strong w-full max-w-[400px] overflow-hidden rounded-[var(--r-xl)] shadow-[var(--shadow-lg)]">
      {/* brand header */}
      <div className="flex flex-col items-center px-8 pt-9 text-center">
        <div className="float-slow grid size-16 place-items-center rounded-[20px] bg-accent text-accent-fg shadow-[0_12px_36px_var(--accent-soft)]">
          <Sparkles className="size-8" />
        </div>
        <h1 className="mt-5 text-[26px] font-extrabold tracking-tight">Welcome to ThothAI</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          Your AI co-pilot for the whole job hunt — search, match, tailor, and track in one place.
        </p>
      </div>

      {/* feature strip */}
      <div className="mt-7 flex flex-col gap-1.5 px-5">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rise flex items-center gap-3 rounded-[var(--r-md)] border border-border bg-glass px-3.5 py-2.5"
              style={{ animationDelay: `${0.08 * (i + 1)}s` }}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-accent-soft text-accent">
                <Icon className="size-[18px]" />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-bold">{f.title}</div>
                <div className="text-[11.5px] text-muted">{f.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* cta */}
      <div className="px-5 pb-7 pt-5">
        <button
          onClick={handleLogin}
          disabled={connecting}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-[var(--r-md)] bg-accent text-[14px] font-semibold text-accent-fg shadow-[0_8px_24px_var(--accent-soft)] transition-all duration-150 hover:bg-accent-strong active:translate-y-px disabled:opacity-70"
        >
          {connecting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Waiting for sign-in…
            </>
          ) : (
            <>
              Continue with Katgen SSO
              <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
        <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] text-faint">
          <ShieldCheck className="size-3.5" />
          One secure account for the entire ecosystem.
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <AuroraBackdrop />
      <div className="relative z-[1] flex min-h-screen items-center justify-center p-6">
        <Suspense fallback={null}>
          <LoginCard />
        </Suspense>
      </div>
    </>
  );
}
