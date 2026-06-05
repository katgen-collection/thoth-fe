"use client";

import { Sparkles, Search, Target, FileText, Lightbulb, type LucideIcon } from "lucide-react";
import { CHAT_SUGGESTIONS } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = { Search, Target, FileText, Lightbulb };

/** New-chat landing: greeting + prompt suggestions. */
export function ChatEmpty({
  onPick,
  onDraft,
}: {
  onPick: (prompt: string) => void;
  /** For suggestions the user must finish (prompt ends with ":") — pre-fill, don't send. */
  onDraft: (prompt: string) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center px-7 py-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-accent text-accent-fg shadow-[0_8px_24px_var(--accent-soft)]">
          <Sparkles className="size-7" />
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight">How can I help?</h1>
        <p className="mt-2 text-[15px] text-muted">
          Search jobs, tailor your CV, or prep for an interview — just ask.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {CHAT_SUGGESTIONS.map((s) => {
          const Icon = ICONS[s.icon] ?? Search;
          // A prompt ending in ":" expects the user to add a posting/role — seed
          // it as a draft so they can finish it instead of firing it half-written.
          const needsInput = s.prompt.trimEnd().endsWith(":");
          return (
            <button
              key={s.title}
              onClick={() => (needsInput ? onDraft(s.prompt) : onPick(s.prompt))}
              className="panel flex items-center gap-3 rounded-[var(--r-md)] px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:bg-glass-hover"
            >
              <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-accent-soft text-accent">
                <Icon className="size-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold">{s.title}</span>
                <span className="mt-0.5 block text-[12.5px] text-muted">{s.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
