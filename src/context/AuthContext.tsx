"use client";

/**
 * Auth state for the app — mirrors chat-frontend's AuthContext.
 *
 * On mount it fetches the current user from `/api/v1/auth/me` (cookie-based).
 * It then refreshes the access token on an interval (~5 min before the 30-min
 * TTL). On refresh failure it clears the user and bounces to /login.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/auth";
import { fetchMe, logout as apiLogout } from "@/lib/api/auth";
import { attemptRefresh } from "@/lib/api/refresh";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Access-token TTL is 30 min; refresh at 25 to stay ahead of expiry.
const REFRESH_INTERVAL_MS = 25 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const scheduleRefresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const ok = await attemptRefresh();
      if (ok) {
        scheduleRefresh();
      } else {
        setUser(null);
        router.replace("/login");
      }
    }, REFRESH_INTERVAL_MS);
  }, [router]);

  const updateUser = useCallback((u: User) => setUser(u), []);

  const logout = useCallback(async () => {
    await apiLogout();
    if (timer.current) clearTimeout(timer.current);
    setUser(null);
    router.replace("/login");
  }, [router]);

  // Validate the session on first mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetchMe();
        if (!cancelled) {
          setUser(me);
          scheduleRefresh();
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [scheduleRefresh]);

  return (
    <AuthContext.Provider value={{ user, isLoading, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
