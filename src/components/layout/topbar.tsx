"use client";

import { usePathname } from "next/navigation";
import { Menu, Sun, Moon } from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "./model-selector";

const TITLES: Record<string, string> = {
  "/chat": "Chat",
  "/cvs": "CV library",
  "/jobs": "Job tracker",
  "/history": "Search history",
  "/settings": "Settings",
};

function titleFor(pathname: string): string {
  if (pathname.startsWith("/chat")) return "Chat";
  const match = Object.keys(TITLES).find(
    (k) => pathname === k || pathname.startsWith(`${k}/`),
  );
  return match ? TITLES[match] : "Thothai";
}

export function TopBar() {
  const pathname = usePathname();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const isChat = pathname.startsWith("/chat");

  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
      >
        <Menu className="size-[18px]" />
      </Button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-bold">{titleFor(pathname)}</div>
        <div className="text-[11.5px] text-faint">Thothai · job-search agent</div>
      </div>
      {isChat && <ModelSelector />}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        title="Toggle theme"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
      </Button>
    </div>
  );
}
