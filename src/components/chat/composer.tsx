"use client";

import { useRef, useState } from "react";
import { Send, Square, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
  /** Optional initial value (e.g. a suggestion the user picked). */
  initialValue?: string;
}

export function Composer({ onSend, onStop, streaming, initialValue = "" }: ComposerProps) {
  const [value, setValue] = useState(initialValue);
  const ref = useRef<HTMLTextAreaElement>(null);

  const grow = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  const submit = () => {
    const text = value.trim();
    if (!text || streaming) return;
    onSend(text);
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  return (
    <div className="mx-auto w-full max-w-[760px]">
      <div className="glass-strong flex flex-col gap-2 rounded-[var(--r-lg)] py-2.5 pl-4 pr-2.5">
        <textarea
          ref={ref}
          value={value}
          rows={1}
          onChange={(e) => {
            setValue(e.target.value);
            grow();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask about jobs, your CV, interviews…"
          className="max-h-[180px] w-full resize-none border-none bg-transparent py-1.5 text-[14.5px] leading-relaxed text-fg outline-none placeholder:text-faint"
        />
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon-sm" title="Attach CV (coming soon)" type="button">
            <Paperclip className="size-[17px]" />
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
