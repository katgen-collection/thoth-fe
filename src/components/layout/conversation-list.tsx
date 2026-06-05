"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { isToday, isYesterday, parseISO } from "date-fns";
import { Trash2 } from "lucide-react";
import {
  useConversations,
  useDeleteConversation,
} from "@/hooks/use-conversations";
import type { Conversation } from "@/types/api";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/states";

function groupOf(c: Conversation): string {
  try {
    const d = parseISO(c.updated_at);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
  } catch {
    /* ignore parse errors */
  }
  return "Previous";
}

const GROUP_ORDER = ["Today", "Yesterday", "Previous"];

export function ConversationList() {
  const { data, isLoading, isError } = useConversations();
  const del = useDeleteConversation();
  // The chat route is an optional catch-all (`/chat/[[...slug]]`), so the active
  // conversation id is the first slug segment.
  const params = useParams<{ slug?: string[] }>();
  const router = useRouter();
  const activeId = params?.slug?.[0];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8 text-muted">
        <Spinner className="size-4" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="px-3 py-6 text-center text-xs text-faint">
        Couldn&apos;t load conversations.
      </p>
    );
  }

  const conversations = data ?? [];
  if (conversations.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-xs text-faint">
        No conversations yet. Start a new chat.
      </p>
    );
  }

  const grouped = new Map<string, Conversation[]>();
  for (const c of conversations) {
    const g = groupOf(c);
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g)!.push(c);
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    del.mutate(id);
    if (activeId === id) router.push("/chat");
  };

  return (
    <div className="flex flex-col gap-1">
      {GROUP_ORDER.filter((g) => grouped.has(g)).map((g) => (
        <div key={g} className="mb-1.5">
          <div className="px-3 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-[0.05em] text-faint">
            {g}
          </div>
          {grouped.get(g)!.map((c) => {
            const active = activeId === c.id;
            return (
              <Link
                key={c.id}
                href={`/chat/${c.id}`}
                className={cn(
                  "group flex items-center gap-2 rounded-[10px] px-3 py-2 transition-colors",
                  active ? "bg-glass-hover" : "hover:bg-glass",
                )}
              >
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-[13px]",
                    active ? "font-semibold text-fg" : "font-medium text-muted",
                  )}
                >
                  {c.title || "Untitled"}
                </span>
                <button
                  onClick={(e) => handleDelete(e, c.id)}
                  className="grid size-6 shrink-0 place-items-center rounded-md text-faint opacity-0 transition-opacity hover:bg-glass-hover hover:text-fg group-hover:opacity-100"
                  title="Delete conversation"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
