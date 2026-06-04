"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/**
 * SSO landing route. The popup arrives here after the gateway sets the session
 * cookie; we navigate the opener (the real app window) to /chat and close the
 * popup. If opened directly (no opener), just navigate this window.
 */
export default function AuthCallback() {
  useEffect(() => {
    if (window.opener) {
      window.opener.location.href = "/chat";
      window.close();
    } else {
      window.location.href = "/chat";
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-0">
      <Loader2 className="size-7 animate-spin text-accent" />
      <p className="text-sm text-muted">Completing sign in…</p>
    </div>
  );
}
