"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Plus,
  FileText,
  Briefcase,
  Clock,
  Settings,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { useAuth } from "@/context/AuthContext";
import { ConversationList } from "./conversation-list";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/cvs", label: "CV library", icon: FileText },
  { href: "/jobs", label: "Job tracker", icon: Briefcase },
  { href: "/history", label: "Search history", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col overflow-hidden rounded-[var(--r-lg)] transition-[width,margin] duration-200",
        // No `glass` (border/shadow) while collapsed, otherwise the 1px border
        // renders as a thin sliver at w-0.
        collapsed ? "mr-0 w-0 border-0 shadow-none" : "glass mr-3 w-[274px]",
      )}
    >
      <div className="flex h-full w-[274px] flex-col">
        {/* brand */}
        <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
          <div className="grid size-[30px] place-items-center rounded-[9px] bg-accent text-accent-fg shadow-[0_3px_10px_var(--accent-soft)]">
            <Sparkles className="size-[17px]" />
          </div>
          <span className="text-[17px] font-extrabold tracking-tight">ThothAI</span>
        </div>

        {/* new chat */}
        <div className="px-3 pb-3 pt-1">
          <Link
            href="/chat"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-[var(--r-sm)] bg-accent text-[13.5px] font-semibold text-accent-fg shadow-[0_2px_8px_var(--accent-soft)] transition-colors hover:bg-accent-strong"
          >
            <Plus className="size-[17px]" /> New chat
          </Link>
        </div>

        {/* conversations */}
        <div className="scroll-area min-h-0 flex-1 px-2">
          <ConversationList />
        </div>

        {/* nav */}
        <nav className="border-t border-border px-2 py-2">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px] transition-colors",
                  active
                    ? "bg-glass-hover font-bold text-fg"
                    : "font-medium text-muted hover:bg-glass",
                )}
              >
                <Icon
                  className={cn("size-[17px] shrink-0", active ? "text-accent" : "text-faint")}
                />
                <span className="min-w-0 flex-1 truncate">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* user */}
        <div className="px-3 pb-3 pt-2">
          <button
            onClick={() => router.push("/settings")}
            className="flex w-full items-center gap-2.5 rounded-[11px] border border-border bg-glass px-2.5 py-2 transition-colors hover:bg-glass-hover"
          >
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt=""
                className="size-[30px] shrink-0 rounded-[9px] object-cover"
              />
            ) : (
              <div className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-accent text-[12px] font-bold text-accent-fg">
                {user ? initials(user.fullname || user.username) : "·"}
              </div>
            )}
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-[13px] font-bold">
                {user?.fullname || user?.username || "Loading…"}
              </div>
              <div className="truncate text-[11px] text-faint">
                {user ? `@${user.username}` : "Not signed in"}
              </div>
            </div>
            <ChevronRight className="size-[15px] shrink-0 text-faint" />
          </button>
        </div>
      </div>
    </aside>
  );
}
