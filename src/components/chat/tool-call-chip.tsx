import { CheckCircle2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Human label for a tool name, shown in the chip header. */
const TOOL_LABELS: Record<string, string> = {
  search_jobs: "Searching jobs",
  analyze_cv: "Analyzing CV",
  match_cv_to_job: "Matching CV",
  generate_cover_letter: "Drafting cover letter",
  suggest_cv_edits: "Suggesting edits",
  save_job: "Saving job",
  get_saved_jobs: "Loading saved jobs",
  update_job_status: "Updating tracker",
  delete_saved_job: "Removing job",
  analyze_job_url: "Reading posting",
  prep_interview: "Preparing questions",
};

export interface ToolCallChipProps {
  tool: string;
  status: string;
  progress: number;
  done: boolean;
  summary?: string;
}

/** The "tool running" chip that resolves into a result line / card. */
export function ToolCallChip({ tool, status, progress, done, summary }: ToolCallChipProps) {
  const label = TOOL_LABELS[tool] ?? tool;
  return (
    <div className="my-1 flex flex-col gap-2.5 rounded-[var(--r-md)] border border-border bg-glass-strong p-3.5 shadow-[inset_0_1px_0_var(--hairline)]">
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
          {done ? (
            <CheckCircle2 className="size-[17px]" />
          ) : (
            <span className="spin grid place-items-center">
              <Search className="size-[15px]" />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[13px] font-bold">
            <span className="mono text-[11.5px] text-faint">{tool}</span>
            <span className="font-semibold text-muted">· {label}</span>
          </div>
          <div className="mt-0.5 truncate text-[12.5px] text-muted">
            {done ? (summary ?? "Done") : status}
          </div>
        </div>
        {!done && (
          <span className="mono shrink-0 text-[12px] font-bold text-accent">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      {!done && (
        <div className="h-1 overflow-hidden rounded-full bg-border">
          <div
            className={cn("h-full rounded-full bg-accent transition-[width] duration-500")}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
