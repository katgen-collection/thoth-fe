import type { SavedJob } from "@/types/api";
import { SavedJobCard } from "./saved-job-card";

/** One column of the tracker board (Saved / Applied / …). */
export function StatusColumn({
  label,
  jobs,
}: {
  label: string;
  jobs: SavedJob[];
}) {
  return (
    <div className="flex min-w-[220px] flex-1 flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[13px] font-bold">{label}</span>
        <span className="mono rounded-full bg-code-bg px-2 py-0.5 text-[11px] font-bold text-muted">
          {jobs.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {jobs.length === 0 ? (
          <div className="rounded-[var(--r-md)] border border-dashed border-border px-3 py-6 text-center text-[12px] text-faint">
            Empty
          </div>
        ) : (
          jobs.map((j) => <SavedJobCard key={j.id} job={j} />)
        )}
      </div>
    </div>
  );
}
