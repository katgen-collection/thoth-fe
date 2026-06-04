"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useUiStore } from "@/stores/ui-store";
import { AuthProvider } from "@/context/AuthContext";

/** Keeps the <html data-theme> attribute in sync with the persisted store. */
function ThemeSync() {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("no-transitions");
    root.setAttribute("data-theme", theme);
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.remove("no-transitions")),
    );
    return () => cancelAnimationFrame(id);
  }, [theme]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <AuthProvider>{children}</AuthProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--glass-strong)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            backdropFilter: "blur(22px) saturate(165%)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
