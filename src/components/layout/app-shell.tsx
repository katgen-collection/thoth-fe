import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";

/** The authed app shell: aurora bg + sidebar + a glass main panel with topbar. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 bg-bg-0" />
      <div className="relative z-[1] flex h-screen p-3">
        <Sidebar />
        <main className="glass flex min-w-0 flex-1 flex-col overflow-hidden rounded-[var(--r-lg)]">
          <TopBar />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </main>
      </div>
    </>
  );
}
