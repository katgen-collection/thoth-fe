import * as React from "react";
import { cn } from "@/lib/utils";

/** Small rounded label. `accent` tints it with the monochrome accent. */
export function Chip({
  className,
  accent,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { accent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        accent
          ? "border-accent-soft bg-accent-soft text-accent"
          : "border-border bg-glass text-muted",
        className,
      )}
      {...props}
    />
  );
}

/** Monospace tag (skills, tech stack). */
export function Tag({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "mono rounded-[7px] border border-border bg-code-bg px-2 py-0.5 text-[11px] font-semibold text-muted",
        className,
      )}
      {...props}
    />
  );
}
