import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Monospace relevance score (6–10) with a star; strong matches read darker. */
export function RelevanceBadge({ score }: { score: number }) {
  const strong = score >= 8.5;
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-1 rounded-lg border border-border bg-code-bg px-1.5 py-0.5 text-[11.5px] font-bold",
        strong ? "text-fg" : "text-muted",
      )}
    >
      <Star
        className={cn("size-3 fill-current", strong ? "opacity-90" : "opacity-55")}
      />
      {score.toFixed(1)}
    </span>
  );
}
