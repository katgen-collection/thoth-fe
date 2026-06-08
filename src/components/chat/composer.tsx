"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send, Square, AtSign, FileText, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMentionables, type Mentionable } from "@/hooks/use-mentions";
import type { MessageReference } from "@/lib/api/chat";

interface ComposerProps {
  onSend: (text: string, references: MessageReference[]) => void;
  onStop: () => void;
  streaming: boolean;
  /** Optional initial value (e.g. a draft prompt the user still has to finish). */
  initialValue?: string;
  /** Focus + grow the textarea on mount (used when seeded with a draft). */
  autoFocus?: boolean;
}

/** A CV/job the user picked from the @-menu, tracked so we can resolve ids on send. */
interface PickedRef extends MessageReference {
  label: string;
}

const MAX_MENU_ITEMS = 6;

/**
 * Find the @-mention the caret is currently inside, if any. The `@` must start
 * the message or follow whitespace; the query runs from there to the caret and
 * may contain spaces (CV/job names do), but not a newline.
 */
function activeMention(value: string, caret: number): { start: number; query: string } | null {
  const upto = value.slice(0, caret);
  const at = upto.lastIndexOf("@");
  if (at === -1) return null;
  if (at > 0 && !/\s/.test(value[at - 1])) return null;
  const query = upto.slice(at + 1);
  if (query.includes("\n") || query.length > 40) return null;
  return { start: at, query };
}

export function Composer({
  onSend,
  onStop,
  streaming,
  initialValue = "",
  autoFocus = false,
}: ComposerProps) {
  const [value, setValue] = useState(initialValue);
  const [refs, setRefs] = useState<PickedRef[]>([]);
  const [mention, setMention] = useState<{ start: number; query: string } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);

  const { items, loading } = useMentionables();

  const grow = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  // When seeded with a draft, focus the textarea (caret at end) and size it.
  useEffect(() => {
    if (!autoFocus) return;
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    grow();
    // mount-only — the parent bumps `key` to re-seed a new draft
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Candidates for the open mention, filtered by the typed query.
  const matches = useMemo<Mentionable[]>(() => {
    if (!mention) return [];
    const q = mention.query.toLowerCase();
    const hits = q
      ? items.filter((m) => m.label.toLowerCase().includes(q))
      : items;
    return hits.slice(0, MAX_MENU_ITEMS);
  }, [mention, items]);

  // Open whenever the caret sits in an @-mention, so typing `@` always gives
  // feedback (a list, a loading hint, or an empty note) — never a silent no-op.
  // Only intercept navigation keys when there are actually items to pick.
  const menuOpen = mention !== null;
  const navigable = matches.length > 0;

  // Recompute the active mention from the textarea's current value + caret.
  const syncMention = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = activeMention(el.value, el.selectionStart ?? el.value.length);
    setMention(next);
    setActiveIndex(0);
  }, []);

  const pick = useCallback(
    (m: Mentionable) => {
      const el = ref.current;
      if (!el || !mention) return;
      const caret = el.selectionStart ?? value.length;
      const token = `@${m.label}`;
      const before = value.slice(0, mention.start);
      const after = value.slice(caret);
      const next = `${before}${token} ${after}`;
      setValue(next);
      setRefs((prev) =>
        prev.some((r) => r.type === m.type && r.id === m.id)
          ? prev
          : [...prev, { type: m.type, id: m.id, label: m.label }],
      );
      setMention(null);
      // Restore focus + place the caret right after the inserted token.
      const pos = before.length + token.length + 1;
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(pos, pos);
        grow();
      });
    },
    [mention, value],
  );

  const submit = () => {
    const text = value.trim();
    if (!text || streaming) return;
    // Only keep references whose token still appears in the text (the user may
    // have deleted a mention after picking it).
    const used = refs.filter((r) => value.includes(`@${r.label}`));
    const deduped = used.filter(
      (r, i) => used.findIndex((o) => o.type === r.type && o.id === r.id) === i,
    );
    onSend(
      text,
      deduped.map(({ type, id }) => ({ type, id })),
    );
    setValue("");
    setRefs([]);
    setMention(null);
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (menuOpen && e.key === "Escape") {
      e.preventDefault();
      setMention(null);
      return;
    }
    if (navigable) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % matches.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + matches.length) % matches.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        pick(matches[activeIndex]);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const insertTrigger = () => {
    const el = ref.current;
    if (!el) return;
    const caret = el.selectionStart ?? value.length;
    const before = value.slice(0, caret);
    const needsSpace = before.length > 0 && !/\s$/.test(before);
    const insert = `${needsSpace ? " " : ""}@`;
    const next = before + insert + value.slice(caret);
    setValue(next);
    const pos = caret + insert.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
      syncMention();
    });
  };

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <div className="glass-strong relative flex flex-col gap-2 rounded-[var(--r-lg)] py-2.5 pl-4 pr-2.5">
        {menuOpen && (
          <ul className="glass-strong absolute bottom-full left-0 mb-2 max-h-[240px] w-[min(420px,100%)] overflow-y-auto rounded-[var(--r-md)] p-1 shadow-lg">
            {!navigable && (
              <li className="px-2.5 py-2 text-[12.5px] text-faint">
                {loading
                  ? "Loading your CVs & jobs…"
                  : items.length === 0
                    ? "No CVs or saved jobs yet — add one to mention it."
                    : "No match — keep typing a CV or job name."}
              </li>
            )}
            {matches.map((m, i) => (
              <li key={`${m.type}:${m.id}`}>
                <button
                  type="button"
                  // Use mousedown so the textarea doesn't blur before the pick fires.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(m);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-2.5 rounded-[var(--r-sm)] px-2.5 py-1.5 text-left text-[13.5px] ${
                    i === activeIndex ? "bg-[var(--surface-hover,rgba(127,127,127,0.12))]" : ""
                  }`}
                >
                  {m.type === "cv" ? (
                    <FileText className="size-4 shrink-0 text-faint" />
                  ) : (
                    <Briefcase className="size-4 shrink-0 text-faint" />
                  )}
                  <span className="truncate text-fg">{m.label}</span>
                  {m.sublabel && (
                    <span className="ml-auto truncate pl-2 text-[11.5px] text-faint">
                      {m.sublabel}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        <textarea
          ref={ref}
          value={value}
          rows={1}
          onChange={(e) => {
            setValue(e.target.value);
            grow();
            syncMention();
          }}
          onKeyUp={syncMention}
          onClick={syncMention}
          onKeyDown={onKeyDown}
          placeholder="Ask about jobs, your CV, interviews…  (@ to mention a CV or job)"
          className="max-h-[180px] w-full resize-none border-none bg-transparent py-1.5 text-[14.5px] leading-relaxed text-fg outline-none placeholder:text-faint"
        />
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Mention a CV or saved job (@)"
            type="button"
            onClick={insertTrigger}
          >
            <AtSign className="size-[17px]" />
          </Button>
          {streaming ? (
            <Button variant="outline" size="icon" onClick={onStop} title="Stop">
              <Square className="size-3 fill-current" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="icon"
              onClick={submit}
              disabled={!value.trim()}
              title="Send"
            >
              <Send className="size-[17px]" />
            </Button>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-faint">
        ThothAI can search live job boards and analyze your CV. Verify details before applying.
      </p>
    </div>
  );
}
