import { AppShell } from "@/components/layout/app-shell";

/** Authed route group. Cookie presence is enforced by middleware.ts. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
