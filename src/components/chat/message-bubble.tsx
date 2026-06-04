import { Sparkles } from "lucide-react";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";
import { ToolCallChip } from "./tool-call-chip";
import { ToolResultCard } from "./tool-result-card";

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "user") {
    return (
      <div className="grid size-[30px] shrink-0 place-items-center rounded-[9px] border border-border bg-user-bubble text-[12px] font-bold text-muted">
        BS
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

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[760px] gap-3 py-3.5",
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
            {message.blocks?.map((block, i) => {
              if (block.kind === "text") {
                if (!block.content && !block.streaming) return null;
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
          </div>
        )}
      </div>
    </div>
  );
}
