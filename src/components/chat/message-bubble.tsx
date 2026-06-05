"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { ChatMessage } from "@/types/chat";
import { cn, initials } from "@/lib/utils";
import { copyText } from "@/lib/clipboard";
import { useAuth } from "@/context/AuthContext";
import { Markdown } from "./markdown";
import { ToolCallChip } from "./tool-call-chip";
import { ToolResultCard } from "./tool-result-card";

/** Copy the assistant's prose; appears on hover once the turn is settled. */
function CopyReply({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      toast.success("Copied");
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Couldn't copy");
    }
  };
  return (
    <button
      onClick={onCopy}
      aria-label="Copy reply"
      title="Copy reply"
      className="mt-1 flex w-fit items-center gap-1 rounded-[var(--r-sm)] px-1.5 py-1 text-[11.5px] font-medium text-faint opacity-0 transition-all hover:bg-glass-hover hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  const { user } = useAuth();
  if (role === "user") {
    if (user?.avatar) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatar}
          alt=""
          className="size-[30px] shrink-0 rounded-[9px] border border-border object-cover"
        />
      );
    }
    return (
      <div className="grid size-[30px] shrink-0 place-items-center rounded-[9px] border border-border bg-user-bubble text-[12px] font-bold text-muted">
        {user ? initials(user.fullname || user.username) : "You"}
      </div>
    );
  }
  return (
    <div className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-accent text-accent-fg shadow-[0_2px_8px_var(--accent-soft)]">
      <Sparkles className="size-4" />
    </div>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  // Concatenated prose of the assistant turn, for the copy action.
  const replyText = isUser
    ? ""
    : (message.blocks ?? [])
        .filter((b) => b.kind === "text")
        .map((b) => (b.kind === "text" ? b.content : ""))
        .join("\n\n")
        .trim();
  const stillStreaming = (message.blocks ?? []).some(
    (b) => b.kind === "text" && b.streaming,
  );
  // A just-started assistant turn (the empty streaming placeholder) has nothing
  // to render yet — show a "Thinking…" pulse so it never looks unresponsive.
  const hasVisibleContent = (message.blocks ?? []).some(
    (b) => (b.kind === "text" && b.content.trim()) || b.kind === "tool",
  );
  const thinking = !isUser && stillStreaming && !hasVisibleContent;

  return (
    <div
      className={cn(
        "group mx-auto flex w-full max-w-[760px] gap-3 py-3.5",
        isUser && "flex-row-reverse",
      )}
    >
      <Avatar role={message.role} />
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          isUser ? "items-end" : "items-stretch",
        )}
      >
        {isUser ? (
          <div className="max-w-[85%] rounded-[var(--r-md)] rounded-tr-[4px] border border-border bg-user-bubble px-3.5 py-2.5 text-[14.5px] leading-snug shadow-[var(--shadow-sm)]">
            {message.text}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {thinking && (
              <div className="flex items-center gap-2 py-1 text-[13.5px] text-muted">
                <span className="flex gap-1">
                  <span className="pulse-dot size-1.5 rounded-full bg-faint" />
                  <span
                    className="pulse-dot size-1.5 rounded-full bg-faint"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="pulse-dot size-1.5 rounded-full bg-faint"
                    style={{ animationDelay: "0.4s" }}
                  />
                </span>
                Thinking…
              </div>
            )}
            {message.blocks?.map((block, i) => {
              if (block.kind === "text") {
                // Empty text block carries no content yet — the "Thinking…"
                // pulse (or a later token) stands in for it.
                if (!block.content) return null;
                return (
                  <div key={i} className="text-[14.5px]">
                    <Markdown>{block.content}</Markdown>
                    {block.streaming && <span className="caret" />}
                  </div>
                );
              }
              // tool block: running/finished chip + optional rich result card
              return (
                <div key={i}>
                  <ToolCallChip
                    tool={block.tool}
                    status={block.status}
                    progress={block.progress}
                    done={block.done}
                    summary={block.summary}
                  />
                  {block.done && block.result && <ToolResultCard result={block.result} />}
                </div>
              );
            })}
            {replyText && !stillStreaming && <CopyReply text={replyText} />}
          </div>
        )}
      </div>
    </div>
  );
}
